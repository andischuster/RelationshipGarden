import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const preorders = sqliteTable("preorders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const activityTemplates = sqliteTable("activity_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // communication, intimacy, fun, growth
  tags: text("tags").notNull(), // JSON string array
  conversationPrompts: text("conversation_prompts").notNull(), // JSON string array
  estimatedTime: text("estimated_time").notNull(),
  difficultyLevel: text("difficulty_level").notNull(), // easy, medium, deep
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const activitySuggestions = sqliteTable("activity_suggestions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  partner1Input: text("partner1_input").notNull(),
  partner2Input: text("partner2_input").notNull(),
  generatedActivity: text("generated_activity").notNull(),
  conversationPrompts: text("conversation_prompts").notNull(), // JSON string array
  category: text("category").notNull(),
  estimatedTime: text("estimated_time").notNull(),
  email: text("email"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const insertPreorderSchema = createInsertSchema(preorders).pick({
  email: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
});

export const insertActivityTemplateSchema = createInsertSchema(activityTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySuggestionSchema = createInsertSchema(activitySuggestions).omit({
  id: true,
  createdAt: true,
});

export type InsertPreorder = z.infer<typeof insertPreorderSchema>;
export type Preorder = typeof preorders.$inferSelect;
export type ActivityTemplate = typeof activityTemplates.$inferSelect;
export type InsertActivityTemplate = z.infer<typeof insertActivityTemplateSchema>;
export type ActivitySuggestion = typeof activitySuggestions.$inferSelect;
export type InsertActivitySuggestion = z.infer<typeof insertActivitySuggestionSchema>;
