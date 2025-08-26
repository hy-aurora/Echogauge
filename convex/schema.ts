import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Define the "users" table to store user information
  users: defineTable({
    email: v.string(),
    clerkId: v.string(),
    password: v.string(),
    name: v.string(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),
});