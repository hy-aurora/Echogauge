import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // legacy users (kept to avoid breaking existing code)
  users: defineTable({
    email: v.string(),
    clerkId: v.string(),
    password: v.string(),
    name: v.string(),
  })
    .index("by_clerkId", ["clerkId"]) 
    .index("by_email", ["email"]),

  // SRS tables
  uploads: defineTable({
    userId: v.string(), // clerk user id
    fileName: v.string(),
    mime: v.string(),
    size: v.number(),
    storageId: v.id("_storage"),
    createdAt: v.number(),
    status: v.string(), // uploaded | processing | done | error
  }).index("by_user", ["userId"]).index("by_created", ["createdAt"]),

  extractions: defineTable({
    uploadId: v.id("uploads"),
    rawText: v.string(),
    method: v.string(), // pdf | ocr
    meta: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_upload", ["uploadId"]),

  analyses: defineTable({
    extractionId: v.id("extractions"),
    metrics: v.any(),
    suggestions: v.array(v.string()),
    modelInfo: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_extraction", ["extractionId"]).index("by_created", ["createdAt"]),

  usage_logs: defineTable({
    userId: v.string(),
    action: v.string(),
    ts: v.number(),
    meta: v.optional(v.any()),
  }).index("by_user", ["userId"]).index("by_ts", ["ts"]),
});