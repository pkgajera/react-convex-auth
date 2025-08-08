import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getTasks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject.split("|")[0];
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addTask = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject.split("|")[0];
    await ctx.db.insert("tasks", {
      text: args.text,
      completed: false,
      userId :userId,
    });
  },
});

export const toggleTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return;
    await ctx.db.patch(args.id, { completed: !task.completed });
  },
});

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const editTask = mutation({
  args: {
    id: v.id("tasks"),
    newText: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { text: args.newText });
  },
});
