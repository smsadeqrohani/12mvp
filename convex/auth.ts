import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Utility functions to reduce code duplication
const requireAuth = async (ctx: any) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
};

const requireAdmin = async (ctx: any) => {
  const userId = await requireAuth(ctx);
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .unique();
  if (!profile?.isAdmin) throw new Error("Admin access required");
  return { userId, profile };
};

const validateQuestion = (args: any) => {
  if (args.grade < 1 || args.grade > 5) throw new Error("Grade must be between 1 and 5");
  if (args.timeToRespond <= 0) throw new Error("Time to respond must be positive");
  if (args.rightAnswer < 1 || args.rightAnswer > 4) throw new Error("Right answer must be between 1 and 4");
};

const getRandomQuestions = async (ctx: any) => {
  const allQuestions = await ctx.db.query("questions").collect();
  if (allQuestions.length < 5) {
    throw new Error("Not enough questions in database");
  }
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5).map((q: any) => q._id);
};

// Admin-only wrapper for mutations and queries
const adminOnly = <T extends any[]>(
  handler: (ctx: any, ...args: T) => Promise<any>
) => {
  return async (ctx: any, ...args: T) => {
    await requireAdmin(ctx);
    return handler(ctx, ...args);
  };
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

export const getUserProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .unique();
    return profile;
  },
});

export const createProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .unique();
    
    if (existingProfile) {
      throw new Error("Profile already exists");
    }
    
    await ctx.db.insert("profiles", {
      userId,
      name: args.name,
      isAdmin: false,
    });
  },
});

export const getAllUsers = query({
  handler: adminOnly(async (ctx) => {
    // Get all profiles with user data
    const profiles = await ctx.db.query("profiles").collect();
    const usersWithProfiles = await Promise.all(
      profiles.map(async (profile: any) => {
        const user = await ctx.db.get(profile.userId);
        return {
          ...profile,
          email: user?.email || "",
          emailVerified: user?.emailVerificationTime ? true : false,
          name: profile.name,
          isAdmin: profile.isAdmin,
        };
      })
    );
    
    return usersWithProfiles;
  }),
});

export const makeUserAdmin = mutation({
  args: { userId: v.id("users"), isAdmin: v.boolean() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can modify user admin status");
    }
    
    // Update target user's profile
    const targetProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!targetProfile) {
      throw new Error("User profile not found");
    }
    
    await ctx.db.patch(targetProfile._id, {
      isAdmin: args.isAdmin,
    });
  },
});

export const updateUserName = mutation({
  args: { userId: v.id("users"), name: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can update user names");
    }
    
    // Update target user's profile
    const targetProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!targetProfile) {
      throw new Error("User profile not found");
    }
    
    await ctx.db.patch(targetProfile._id, {
      name: args.name,
    });
  },
});

export const resetUserPassword = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can reset user passwords");
    }
    
    // For now, we'll just return success
    // In a real implementation, you'd send a password reset email
    // or generate a temporary password
    return { success: true, message: "Password reset initiated" };
  },
});

// Questions CRUD operations
export const getAllQuestions = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can view all questions");
    }
    
    return await ctx.db.query("questions").collect();
  },
});

export const createQuestion = mutation({
  args: {
    mediaPath: v.optional(v.string()),
    mediaStorageId: v.optional(v.id("_storage")),
    questionText: v.string(),
    option1Text: v.string(),
    option2Text: v.string(),
    option3Text: v.string(),
    option4Text: v.string(),
    rightAnswer: v.number(),
    timeToRespond: v.number(),
    grade: v.number(),
    category: v.optional(v.string()),
  },
  handler: adminOnly(async (ctx, args) => {
    validateQuestion(args);
    
    return await ctx.db.insert("questions", {
      mediaPath: args.mediaPath,
      mediaStorageId: args.mediaStorageId,
      questionText: args.questionText,
      option1Text: args.option1Text,
      option2Text: args.option2Text,
      option3Text: args.option3Text,
      option4Text: args.option4Text,
      rightAnswer: args.rightAnswer,
      timeToRespond: args.timeToRespond,
      grade: args.grade,
      category: args.category,
    });
  }),
});

export const updateQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    mediaPath: v.optional(v.string()),
    mediaStorageId: v.optional(v.id("_storage")),
    questionText: v.string(),
    option1Text: v.string(),
    option2Text: v.string(),
    option3Text: v.string(),
    option4Text: v.string(),
    rightAnswer: v.number(),
    timeToRespond: v.number(),
    grade: v.number(),
    category: v.optional(v.string()),
  },
  handler: adminOnly(async (ctx, args) => {
    validateQuestion(args);
    
    // Check if question exists
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }
    
    await ctx.db.patch(args.questionId, {
      mediaPath: args.mediaPath,
      mediaStorageId: args.mediaStorageId,
      questionText: args.questionText,
      option1Text: args.option1Text,
      option2Text: args.option2Text,
      option3Text: args.option3Text,
      option4Text: args.option4Text,
      rightAnswer: args.rightAnswer,
      timeToRespond: args.timeToRespond,
      grade: args.grade,
      category: args.category,
    });
  }),
});

export const deleteQuestion = mutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can delete questions");
    }
    
    // Check if question exists
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }
    
    // Delete associated media file if exists
    if (question.mediaStorageId) {
      await ctx.storage.delete(question.mediaStorageId);
    }
    
    await ctx.db.delete(args.questionId);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can upload media");
    }
    
    return await ctx.storage.generateUploadUrl();
  },
});

export const getMediaUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can view media");
    }
    
    return await ctx.storage.getUrl(args.storageId);
  },
});

// File management functions
export const getAllFiles = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can view all files");
    }
    
    const files = await ctx.db.query("files").collect();
    
    // Get uploader names
    const filesWithUploaderNames = await Promise.all(
      files.map(async (file) => {
        const uploader = await ctx.db.get(file.uploadedBy);
        return {
          ...file,
          uploaderName: uploader?.email || "Unknown",
        };
      })
    );
    
    return filesWithUploaderNames;
  },
});

export const uploadFile = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    originalName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can upload files");
    }
    
    return await ctx.db.insert("files", {
      storageId: args.storageId,
      fileName: args.fileName,
      originalName: args.originalName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      uploadedBy: currentUserId,
      uploadedAt: Date.now(),
    });
  },
});

export const renameFile = mutation({
  args: {
    fileId: v.id("files"),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can rename files");
    }
    
    // Check if file exists
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    
    await ctx.db.patch(args.fileId, {
      fileName: args.newName,
    });
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can delete files");
    }
    
    // Check if file exists
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    
    // Delete from storage
    await ctx.storage.delete(file.storageId);
    
    // Delete from database
    await ctx.db.delete(args.fileId);
  },
});

// Match management functions
export const createMatch = mutation({
  args: {},
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    // Check if user already has an active match
    const existingMatches = await ctx.db
      .query("matchParticipants")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .collect();
    
    // Check if any of these matches are still active
    for (const participant of existingMatches) {
      const match = await ctx.db.get(participant.matchId);
      if (match && (match.status === "waiting" || match.status === "active")) {
        throw new Error("You already have an active match");
      }
    }
    
    // First, try to find an existing waiting match to join
    const waitingMatches = await ctx.db
      .query("matches")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();
    
    for (const match of waitingMatches) {
      const participants = await ctx.db
        .query("matchParticipants")
        .withIndex("by_match", (q) => q.eq("matchId", match._id))
        .collect();
      
      // Check if current user is already in this match
      const isAlreadyParticipant = participants.some(p => p.userId === currentUserId);
      if (isAlreadyParticipant) {
        continue;
      }
      
      // If match has only one participant, join it and start the match
      if (participants.length === 1) {
        await ctx.db.insert("matchParticipants", {
          matchId: match._id,
          userId: currentUserId,
          joinedAt: Date.now(),
        });
        
        // Start the match (make it active)
        await ctx.db.patch(match._id, {
          status: "active",
          startedAt: Date.now(),
          currentQuestionIndex: 0,
        });
        
        return match._id;
      }
    }
    
    // If no waiting match found, create a new one
    const selectedQuestions = await getRandomQuestions(ctx);
    
    // Create match
    const matchId = await ctx.db.insert("matches", {
      status: "waiting",
      createdAt: Date.now(),
      questions: selectedQuestions,
    });
    
    // Add current user as participant
    await ctx.db.insert("matchParticipants", {
      matchId,
      userId: currentUserId,
      joinedAt: Date.now(),
    });
    
    return matchId;
  },
});

// joinMatch function removed - createMatch now handles both creation and joining automatically

// findAvailableMatch function removed - createMatch now handles matchmaking automatically

export const getMatchDetails = query({
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
    
    // Check if user is participant
    const participant = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .unique();
    
    if (!participant) {
      throw new Error("You are not a participant in this match");
    }
    
    // Get all participants with their profiles
    const participants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();
    
    const participantsWithProfiles = await Promise.all(
      participants.map(async (p) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q: any) => q.eq("userId", p.userId))
          .unique();
        return {
          ...p,
          profile,
        };
      })
    );
    
    // Get questions
    const questions = await Promise.all(
      match.questions.map(async (questionId) => {
        return await ctx.db.get(questionId);
      })
    );
    
    return {
      match,
      participants: participantsWithProfiles,
      questions,
    };
  },
});

export const getUserActiveMatch = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null; // Return null instead of throwing error for unauthenticated users
    }
    
    // Find user's active matches - this query will be reactive to changes in matchParticipants
    const userMatches = await ctx.db
      .query("matchParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    for (const participant of userMatches) {
      const match = await ctx.db.get(participant.matchId);
      if (match && (match.status === "waiting" || match.status === "active")) {
        return participant.matchId;
      }
    }
    
    return null;
  },
});

// Simplified query that directly monitors match status changes
export const getUserActiveMatchStatus = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null; // Return null instead of throwing error for unauthenticated users
    }
    
    // Get all user's match participants - this query is reactive to matchParticipants table
    const userMatches = await ctx.db
      .query("matchParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    // For each participant, get the match and check if it's active/waiting
    for (const participant of userMatches) {
      const match = await ctx.db.get(participant.matchId);
      if (match && (match.status === "waiting" || match.status === "active")) {
        // Return just the status and matchId for maximum reactivity
        return {
          matchId: participant.matchId,
          status: match.status
        };
      }
    }
    
    return null;
  },
});

export const leaveMatch = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    // Get match
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }
    
    if (match.status === "completed") {
      throw new Error("Cannot leave completed match");
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
    
    // Remove participant
    await ctx.db.delete(participant._id);
    
    // If match becomes empty or has only one participant, cancel it
    const remainingParticipants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();
    
    if (remainingParticipants.length <= 1) {
      await ctx.db.patch(args.matchId, {
        status: "cancelled",
        completedAt: Date.now(),
      });
      
      // Also delete all remaining participants
      for (const participant of remainingParticipants) {
        await ctx.db.delete(participant._id);
      }
    }
    
    return true;
  },
});

// cancelMatch function removed - leaveMatch now handles both leaving and cancelling

// Quiz logic functions
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
    
    if (match.status !== "active") {
      throw new Error("Match is not active");
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
    
    // Check if answer is correct (0 means no answer, so always incorrect)
    const isCorrect = args.selectedAnswer === question.rightAnswer && args.selectedAnswer !== 0;
    
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
    if (updatedAnswers.length === match.questions.length) {
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
        
        // Mark match as completed
        await ctx.db.patch(args.matchId, {
          status: "completed",
          completedAt: Date.now(),
        });
      }
    }
    
    return { isCorrect, correctAnswer: question.rightAnswer };
  },
});

export const getMatchResults = query({
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
    
    if (match.status !== "completed") {
      throw new Error("Match is not completed yet");
    }
    
    // Get match result
    const result = await ctx.db
      .query("matchResults")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .unique();
    
    if (!result) {
      throw new Error("Match result not found");
    }
    
    // Get participants with profiles
    const participants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();
    
    const participantsWithProfiles = await Promise.all(
      participants.map(async (p) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q: any) => q.eq("userId", p.userId))
          .unique();
        return {
          ...p,
          profile,
        };
      })
    );
    
    // Get questions with answers
    const questions = await Promise.all(
      match.questions.map(async (questionId) => {
        const question = await ctx.db.get(questionId);
        return question;
      })
    );
    
    return {
      match,
      result,
      participants: participantsWithProfiles,
      questions,
    };
  },
});

export const getUserMatchHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Get user's completed matches
    const userMatches = await ctx.db
      .query("matchParticipants")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .collect();
    
    const completedMatches = [];
    
    for (const participant of userMatches) {
      const match = await ctx.db.get(participant.matchId);
      if (match && match.status === "completed") {
        const result = await ctx.db
          .query("matchResults")
          .withIndex("by_match", (q) => q.eq("matchId", participant.matchId))
          .unique();
        
        if (result) {
          // Get opponent info
          const opponentId = result.player1Id === currentUserId ? result.player2Id : result.player1Id;
          const opponentProfile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q: any) => q.eq("userId", opponentId))
            .unique();
          
          completedMatches.push({
            match,
            result,
            participant,
            opponent: opponentProfile,
            isWinner: result.winnerId === currentUserId,
            isDraw: result.isDraw,
          });
        }
      }
    }
    
    // Sort by completion time (newest first)
    completedMatches.sort((a, b) => b.match.completedAt! - a.match.completedAt!);
    
    // Apply limit
    const limit = args.limit || 20;
    return completedMatches.slice(0, limit);
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

export const getMatchResultsPartial = query({
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
    
    // Allow partial results even if match is not completed yet
    // This is for when one player finishes early
    
    // Get participants with profiles
    const participants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();
    
    const participantsWithProfiles = await Promise.all(
      participants.map(async (p) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q: any) => q.eq("userId", p.userId))
          .unique();
        return {
          ...p,
          profile,
        };
      })
    );
    
    // Get questions with answers
    const questions = await Promise.all(
      match.questions.map(async (questionId) => {
        const question = await ctx.db.get(questionId);
        return question;
      })
    );
    
    // Get match result if completed
    let result = null;
    if (match.status === "completed") {
      result = await ctx.db
        .query("matchResults")
        .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
        .unique();
    }
    
    return {
      match,
      result,
      participants: participantsWithProfiles,
      questions,
      isCompleted: match.status === "completed",
    };
  },
});

export const getQuestionMediaUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.storage.getUrl(args.storageId);
  },
});
