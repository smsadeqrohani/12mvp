import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getRandomQuestions, awardPoints, deductPoints } from "./utils";

/**
 * Match gameplay operations - answer submission, completion checking
 */

export const submitAnswer = mutation({
  args: {
    matchId: v.id("matches"),
    questionId: v.id("questions"),
    selectedAnswer: v.number(),
    timeSpent: v.number(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Get match
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }
    
    const isCreatorSoloPlay =
      match.status === "waiting" && match.creatorId === currentUserId;

    if (!isCreatorSoloPlay && match.status !== "active") {
      throw new Error("Match is not active");
    }

    if (Date.now() > match.expiresAt) {
      throw new Error("Match has expired");
    }
    
    // Get question
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }
    
    // Check if question is part of this match
    if (!match.questions.includes(args.questionId)) {
      throw new Error("Question is not part of this match");
    }
    
    // Find user's participation
    const participant = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .unique();
    
    if (!participant) {
      throw new Error("You are not a participant in this match");
    }
    
    // Check if user already answered this question
    const existingAnswer = participant.answers?.find(
      (answer) => answer.questionId === args.questionId
    );
    
    if (existingAnswer) {
      throw new Error("You have already answered this question");
    }
    
    // Check if answer is valid (0-4, where 0 means no answer)
    if (args.selectedAnswer < 0 || args.selectedAnswer > 4) {
      throw new Error("Invalid answer selection");
    }
    
    // Get correct answer from secure table (backend-only check)
    const answerEntry = await ctx.db
      .query("questionAnswers")
      .withIndex("by_question", (q: any) => q.eq("questionId", args.questionId))
      .unique();
    
    if (!answerEntry) {
      throw new Error("Question answer not found");
    }
    
    // Check if answer is correct (0 means no answer, so always incorrect)
    const isCorrect = args.selectedAnswer === answerEntry.correctOption && args.selectedAnswer !== 0;
    
    // Add answer to participant's answers
    const newAnswer = {
      questionId: args.questionId,
      selectedAnswer: args.selectedAnswer,
      timeSpent: args.timeSpent,
      isCorrect,
    };
    
    const updatedAnswers = [...(participant.answers || []), newAnswer];
    
    // Update participant
    await ctx.db.patch(participant._id, {
      answers: updatedAnswers,
    });
    
    // Check if this was the last question for this user
    const userCompleted = updatedAnswers.length === match.questions.length;
    
    if (userCompleted) {
      // Calculate total score and time
      const totalScore = updatedAnswers.filter(a => a.isCorrect).length;
      const totalTime = updatedAnswers.reduce((sum, a) => sum + a.timeSpent, 0);
      
      await ctx.db.patch(participant._id, {
        totalScore,
        totalTime,
        completedAt: Date.now(),
      });
      
      // Check if both players have completed
      const allParticipants = await ctx.db
        .query("matchParticipants")
        .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
        .collect();
      
      const allCompleted = allParticipants.every(p => p.completedAt);
      
      if (allCompleted && allParticipants.length === 2) {
        // Calculate match results
        const [player1, player2] = allParticipants;
        
        let winnerId = null;
        let isDraw = false;
        
        if (player1.totalScore! > player2.totalScore!) {
          winnerId = player1.userId;
        } else if (player2.totalScore! > player1.totalScore!) {
          winnerId = player2.userId;
        } else {
          // Tie on score, check time
          if (player1.totalTime! < player2.totalTime!) {
            winnerId = player1.userId;
          } else if (player2.totalTime! < player1.totalTime!) {
            winnerId = player2.userId;
          } else {
            isDraw = true;
          }
        }
        
        // Create match result
        await ctx.db.insert("matchResults", {
          matchId: args.matchId,
          winnerId: winnerId || undefined,
          isDraw,
          player1Id: player1.userId,
          player2Id: player2.userId,
          player1Score: player1.totalScore!,
          player2Score: player2.totalScore!,
          player1Time: player1.totalTime!,
          player2Time: player2.totalTime!,
          completedAt: Date.now(),
        });
        
        // Update players' cumulative correct answers on their profiles
        const participantsToUpdate = [player1, player2];
        for (const p of participantsToUpdate) {
          const profile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q: any) => q.eq("userId", p.userId))
            .unique();
          if (profile) {
            const prev = profile.correctAnswersTotal ?? 0;
            const toAdd = p.totalScore ?? 0;
            if (toAdd > 0) {
              await ctx.db.patch(profile._id, {
                correctAnswersTotal: prev + toAdd,
              });
            }
          }
        }
        
        // Mark match as completed
        await ctx.db.patch(args.matchId, {
          status: "completed",
          completedAt: Date.now(),
        });
        
        // Award +2 points to match creator after the game ends (if exists)
        if (match.creatorId) {
          await awardPoints(ctx, match.creatorId, 2);
        }
        
        // Check if this is a tournament match and update tournament match status
        const tournamentMatch = await ctx.db
          .query("tournamentMatches")
          .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
          .unique();
        
        if (tournamentMatch) {
          // Update tournament match status and set winner
          await ctx.db.patch(tournamentMatch._id, {
            status: "completed",
            winnerId: winnerId || undefined,
          });
          
          // No points for winning a tournament semifinal or non-final match
          
          // If this is a semifinal, check if we should create the final match
          if (tournamentMatch.round === "semi1" || tournamentMatch.round === "semi2") {
            // Get all tournament matches
            const tournamentMatches = await ctx.db
              .query("tournamentMatches")
              .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentMatch.tournamentId))
              .collect();
            
            const semi1 = tournamentMatches.find((m: any) => m.round === "semi1");
            const semi2 = tournamentMatches.find((m: any) => m.round === "semi2");
            const final = tournamentMatches.find((m: any) => m.round === "final");
            
            // Check if both semifinals are completed
            if (semi1?.status === "completed" && semi1.winnerId && 
                semi2?.status === "completed" && semi2.winnerId) {
              
              // Get winner IDs
              const winner1Id = semi1.winnerId;
              const winner2Id = semi2.winnerId;
              
              // Get tournament to check category
              const tournament = await ctx.db
                .query("tournaments")
                .filter((q) => q.eq(q.field("tournamentId"), tournamentMatch.tournamentId))
                .unique();
              
              // Get questions based on tournament category (or random if isRandom is true)
              const categoryId = tournament?.isRandom ? undefined : tournament?.categoryId;
              
              // Create the actual final match using the tournament match creation logic
              const finalQuestions = await getRandomQuestions(ctx, categoryId);
              
              const now = Date.now();
              const expiresAt = now + (24 * 60 * 60 * 1000);
              
              const finalMatchId = await ctx.db.insert("matches", {
                status: "waiting",
                createdAt: now,
                expiresAt,
                questions: finalQuestions,
                creatorId: winner1Id as Id<"users">,
              });
              
              await ctx.db.insert("matchParticipants", {
                matchId: finalMatchId,
                userId: winner1Id as Id<"users">,
                joinedAt: now,
              });
              
              await ctx.db.insert("matchParticipants", {
                matchId: finalMatchId,
                userId: winner2Id as Id<"users">,
                joinedAt: now,
              });
              
              // Both players are already added, so match can be active
              await ctx.db.patch(finalMatchId, {
                status: "active",
                startedAt: now,
              });
              
              // Create or update final tournament match entry
              if (final) {
                // Update existing final entry
                await ctx.db.patch(final._id, {
                  matchId: finalMatchId,
                  player1Id: winner1Id as Id<"users">,
                  player2Id: winner2Id as Id<"users">,
                  status: "active",
                });
              } else {
                // Create new final entry
                await ctx.db.insert("tournamentMatches", {
                  tournamentId: tournamentMatch.tournamentId,
                  matchId: finalMatchId,
                  round: "final",
                  player1Id: winner1Id as Id<"users">,
                  player2Id: winner2Id as Id<"users">,
                  status: "active",
                });
              }
            }
          }
          
          // For final match, we also need to update the tournament status
          if (tournamentMatch.round === "final") {
            // Find the tournament and mark it as completed
            const tournament = await ctx.db
              .query("tournaments")
              .filter((q) => q.eq(q.field("tournamentId"), tournamentMatch.tournamentId))
              .unique();
            
            if (tournament) {
              await ctx.db.patch(tournament._id, {
                status: "completed",
                completedAt: Date.now(),
              });
              
              // Award +10 points for winning the tournament
              if (winnerId && !isDraw) {
                await awardPoints(ctx, winnerId, 10);
              }
              
              // Award +4 points to tournament creator upon tournament completion
              if (tournament.creatorId) {
                await awardPoints(ctx, tournament.creatorId, 4);
              }
            }
          }
        } else {
          // This is a single match (not a tournament match)
          // Award +5 points for winning a single match
          if (winnerId && !isDraw) {
            await awardPoints(ctx, winnerId, 5);
          }
        }
      }
    }
    
    // Return result without exposing correct answer
    return { 
      isCorrect,
      userCompleted,
    };
  },
});

export const checkMatchCompletion = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Get match
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }
    
    // Get all participants
    const participants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();
    
    // Check if all participants have completed
    const allCompleted = participants.every(p => p.completedAt);
    
    return {
      match,
      participants,
      allCompleted,
      isCompleted: match.status === "completed",
    };
  },
});

/**
 * Disable wrong options from a question
 * Returns the options to disable (wrong answers only, not the correct one)
 */
export const disableWrongOptions = mutation({
  args: {
    matchId: v.id("matches"),
    questionId: v.id("questions"),
    numOptionsToDisable: v.number(), // 1 or 2
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Validate numOptionsToDisable
    if (args.numOptionsToDisable !== 1 && args.numOptionsToDisable !== 2) {
      throw new Error("Number of options to disable must be 1 or 2");
    }
    
    // Get match
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }
    
    const isCreatorSoloPlay =
      match.status === "waiting" && match.creatorId === currentUserId;

    if (!isCreatorSoloPlay && match.status !== "active") {
      throw new Error("Match is not active");
    }

    if (Date.now() > match.expiresAt) {
      throw new Error("Match has expired");
    }
    
    // Check if question is part of this match
    if (!match.questions.includes(args.questionId)) {
      throw new Error("Question is not part of this match");
    }
    
    // Find user's participation
    const participant = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .unique();
    
    if (!participant) {
      throw new Error("You are not a participant in this match");
    }
    
    // Check if user already answered this question
    const existingAnswer = participant.answers?.find(
      (answer) => answer.questionId === args.questionId
    );
    
    if (existingAnswer) {
      throw new Error("You have already answered this question");
    }
    
    // Check if user's single active mentor (latest purchase) matches this request
    let hasActiveMentor = false;
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    const now = Date.now();
    let latest: { purchasedAt: number; mentorMode: 0 | 1 | 2 } | null = null;
    for (const purchase of purchases) {
      const item = await ctx.db.get(purchase.itemId);
      if (!item || item.itemType !== "mentor") continue;
      const isActive = item.durationMs === 0 || (purchase.purchasedAt + purchase.durationMs > now);
      if (!isActive) continue;
      const mode = (item.mentorMode ?? 0) as 0 | 1 | 2;
      if (!latest || purchase.purchasedAt > latest.purchasedAt) {
        latest = { purchasedAt: purchase.purchasedAt, mentorMode: mode };
      }
    }
    if (latest && latest.mentorMode === args.numOptionsToDisable) {
      hasActiveMentor = true;
    }
    
    // Get user profile to check points (only if not using mentor)
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .unique();
    
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    const currentPoints = profile.points ?? 0;
    const cost = args.numOptionsToDisable === 1 ? 2 : 5;
    
    // Only check points if not using mentor
    if (!hasActiveMentor && currentPoints < cost) {
      throw new Error(`Not enough points. You need ${cost} points but only have ${currentPoints}`);
    }
    
    // Get question
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }
    
    // Get correct answer from secure table
    const answerEntry = await ctx.db
      .query("questionAnswers")
      .withIndex("by_question", (q: any) => q.eq("questionId", args.questionId))
      .unique();
    
    if (!answerEntry) {
      throw new Error("Question answer not found");
    }
    
    const correctOption = answerEntry.correctOption;
    
    // Get all wrong options (all options except the correct one)
    const wrongOptions = [1, 2, 3, 4].filter(opt => opt !== correctOption);
    
    // Shuffle wrong options and take the requested number
    const shuffled = wrongOptions.sort(() => 0.5 - Math.random());
    const optionsToDisable = shuffled.slice(0, args.numOptionsToDisable);
    
    // Deduct points only if not using mentor
    if (!hasActiveMentor) {
      await deductPoints(ctx, currentUserId, cost);
    }
    
    // Return the options to disable (without exposing the correct answer)
    return {
      disabledOptions: optionsToDisable,
      remainingPoints: hasActiveMentor ? currentPoints : currentPoints - cost,
    };
  },
});

/**
 * Add time boost to current question (+10 seconds, costs 5 points)
 */
export const addTimeBoost = mutation({
  args: {
    matchId: v.id("matches"),
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Get match
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }
    
    const isCreatorSoloPlay =
      match.status === "waiting" && match.creatorId === currentUserId;

    if (!isCreatorSoloPlay && match.status !== "active") {
      throw new Error("Match is not active");
    }

    if (Date.now() > match.expiresAt) {
      throw new Error("Match has expired");
    }
    
    // Check if question is part of this match
    if (!match.questions.includes(args.questionId)) {
      throw new Error("Question is not part of this match");
    }
    
    // Find user's participation
    const participant = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .unique();
    
    if (!participant) {
      throw new Error("You are not a participant in this match");
    }
    
    // Check if user already answered this question
    const existingAnswer = participant.answers?.find(
      (answer) => answer.questionId === args.questionId
    );
    
    if (existingAnswer) {
      throw new Error("You have already answered this question");
    }
    
    // Get user profile to check points
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .unique();
    
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    const currentPoints = profile.points ?? 0;
    const cost = 5;
    
    if (currentPoints < cost) {
      throw new Error(`Not enough points. You need ${cost} points but only have ${currentPoints}`);
    }
    
    // Deduct points
    await deductPoints(ctx, currentUserId, cost);
    
    // Return success and remaining points
    return {
      success: true,
      timeAdded: 10, // 10 seconds
      remainingPoints: currentPoints - cost,
    };
  },
});

