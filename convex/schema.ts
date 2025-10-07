import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    isAdmin: v.boolean(),
  }).index("by_user", ["userId"]),
  
  questions: defineTable({
    mediaPath: v.optional(v.string()),
    mediaStorageId: v.optional(v.id("_storage")),
    questionText: v.string(),
    option1Text: v.string(),
    option2Text: v.string(),
    option3Text: v.string(),
    option4Text: v.string(),
    timeToRespond: v.number(),
    grade: v.number(),
    category: v.optional(v.string()),
  }),
  
  questionAnswers: defineTable({
    questionId: v.id("questions"),
    correctOption: v.number(), // 1, 2, 3, or 4
  }).index("by_question", ["questionId"]),
  
  files: defineTable({
    storageId: v.id("_storage"),
    fileName: v.string(),
    originalName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    uploadedBy: v.id("users"),
    uploadedAt: v.number(),
  }),
  
  matches: defineTable({
    status: v.union(v.literal("waiting"), v.literal("active"), v.literal("completed"), v.literal("cancelled")),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    questions: v.array(v.id("questions")),
    currentQuestionIndex: v.optional(v.number()),
    creatorId: v.optional(v.id("users")),
  }).index("by_status", ["status"]),
  
  matchParticipants: defineTable({
    matchId: v.id("matches"),
    userId: v.id("users"),
    joinedAt: v.number(),
    answers: v.optional(v.array(v.object({
      questionId: v.id("questions"),
      selectedAnswer: v.number(),
      timeSpent: v.number(),
      isCorrect: v.boolean(),
    }))),
    totalScore: v.optional(v.number()),
    totalTime: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  }).index("by_match", ["matchId"]).index("by_user", ["userId"]),
  
  matchResults: defineTable({
    matchId: v.id("matches"),
    winnerId: v.optional(v.id("users")),
    isDraw: v.boolean(),
    player1Id: v.id("users"),
    player2Id: v.id("users"),
    player1Score: v.number(),
    player2Score: v.number(),
    player1Time: v.number(),
    player2Time: v.number(),
    completedAt: v.number(),
  }).index("by_match", ["matchId"]).index("by_player", ["player1Id", "player2Id"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
