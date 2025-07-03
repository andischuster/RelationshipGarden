import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const preorders = pgTable("preorders", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityTemplates = pgTable("activity_templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // communication, intimacy, fun, growth
  tags: text("tags").array().notNull(),
  conversationPrompts: text("conversation_prompts").array().notNull(),
  estimatedTime: text("estimated_time").notNull(),
  difficultyLevel: text("difficulty_level").notNull(), // easy, medium, deep
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activitySuggestions = pgTable("activity_suggestions", {
  id: serial("id").primaryKey(),
  partner1Input: text("partner1_input").notNull(),
  partner2Input: text("partner2_input").notNull(),
  generatedActivity: text("generated_activity").notNull(),
  conversationPrompts: text("conversation_prompts").array().notNull(),
  category: text("category").notNull(),
  estimatedTime: text("estimated_time").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
