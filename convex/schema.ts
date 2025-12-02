import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    isAdmin: v.boolean(),
    points: v.optional(v.number()),
    correctAnswersTotal: v.optional(v.number()),
    avatarId: v.optional(v.string()),
  }).index("by_user", ["userId"]),
  
  categories: defineTable({
    persianName: v.string(),
    slug: v.string(),
    englishName: v.optional(v.string()),
  }).index("by_slug", ["slug"]),
  
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
  }),
  
  questionCategories: defineTable({
    questionId: v.id("questions"),
    categoryId: v.id("categories"),
  })
    .index("by_question", ["questionId"])
    .index("by_category", ["categoryId"])
    .index("by_question_category", ["questionId", "categoryId"]),
  
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
    expiresAt: v.number(),
    questions: v.array(v.id("questions")),
    currentQuestionIndex: v.optional(v.number()),
    creatorId: v.optional(v.id("users")),
  }).index("by_status", ["status"]).index("by_expiration", ["expiresAt"]),
  
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
  
  tournaments: defineTable({
    status: v.union(v.literal("waiting"), v.literal("active"), v.literal("completed"), v.literal("cancelled")),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    expiresAt: v.number(),
    creatorId: v.id("users"),
    tournamentId: v.string(), // Unique tournament identifier
    categoryId: v.optional(v.id("categories")), // Tournament category, null for random
    isRandom: v.boolean(), // Whether tournament uses random questions
  }).index("by_status", ["status"]).index("by_expiration", ["expiresAt"]),
  
  tournamentParticipants: defineTable({
    tournamentId: v.string(),
    userId: v.id("users"),
    joinedAt: v.number(),
  }).index("by_tournament", ["tournamentId"]).index("by_user", ["userId"]),
  
  tournamentMatches: defineTable({
    tournamentId: v.string(),
    matchId: v.id("matches"),
    round: v.union(v.literal("semi1"), v.literal("semi2"), v.literal("final")),
    player1Id: v.id("users"),
    player2Id: v.id("users"),
    status: v.union(v.literal("waiting"), v.literal("active"), v.literal("completed")),
    winnerId: v.optional(v.id("users")),
  }).index("by_tournament", ["tournamentId"]).index("by_match", ["matchId"]),
  
  storeItems: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(), // Price in points
    itemType: v.optional(v.union(v.literal("stadium"), v.literal("mentor"))), // Type of item (optional for backward compatibility)
    // Stadium fields
    matchesBonus: v.optional(v.number()), // Additional matches limit (for stadium)
    tournamentsBonus: v.optional(v.number()), // Additional tournaments limit (for stadium)
    // Mentor fields
    mentorMode: v.optional(v.union(v.literal(1), v.literal(2))), // 1 = disable 1 option, 2 = disable 2 options (for mentor)
    durationMs: v.number(), // Duration in milliseconds (e.g., 30 days = 30 * 24 * 60 * 60 * 1000)
    isActive: v.boolean(), // Whether item is available for purchase
  }),
  
  purchases: defineTable({
    userId: v.id("users"),
    itemId: v.id("storeItems"),
    purchasedAt: v.number(),
    durationMs: v.number(), // Duration from the item at time of purchase
  }).index("by_user", ["userId"]).index("by_item", ["itemId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
