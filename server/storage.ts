import { 
  preorders, 
  activityTemplates, 
  activitySuggestions,
  type Preorder, 
  type InsertPreorder,
  type ActivityTemplate,
  type InsertActivityTemplate,
  type ActivitySuggestion,
  type InsertActivitySuggestion
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  createPreorder(preorder: InsertPreorder): Promise<Preorder>;
  getPreorderByEmail(email: string): Promise<Preorder | undefined>;
  
  // Activity Templates
  createActivityTemplate(template: InsertActivityTemplate): Promise<ActivityTemplate>;
  getActivityTemplatesByCategory(category: string): Promise<ActivityTemplate[]>;
  getAllActivityTemplates(): Promise<ActivityTemplate[]>;
  
  // Activity Suggestions
  createActivitySuggestion(suggestion: InsertActivitySuggestion): Promise<ActivitySuggestion>;
  getActivitySuggestionsByEmail(email: string): Promise<ActivitySuggestion[]>;
}

export class DatabaseStorage implements IStorage {
  async createPreorder(insertPreorder: InsertPreorder): Promise<Preorder> {
    const [preorder] = await db
      .insert(preorders)
      .values(insertPreorder)
      .returning();
    return preorder;
  }

  async getPreorderByEmail(email: string): Promise<Preorder | undefined> {
    const [preorder] = await db.select().from(preorders).where(eq(preorders.email, email));
    return preorder || undefined;
  }

  // Activity Templates
  async createActivityTemplate(template: InsertActivityTemplate): Promise<ActivityTemplate> {
    const [activityTemplate] = await db
      .insert(activityTemplates)
      .values(template)
      .returning();
    return activityTemplate;
  }

  async getActivityTemplatesByCategory(category: string): Promise<ActivityTemplate[]> {
    return await db.select().from(activityTemplates).where(eq(activityTemplates.category, category));
  }

  async getAllActivityTemplates(): Promise<ActivityTemplate[]> {
    return await db.select().from(activityTemplates);
  }

  // Activity Suggestions
  async createActivitySuggestion(suggestion: InsertActivitySuggestion): Promise<ActivitySuggestion> {
    // Convert arrays to JSON strings for SQLite
    const sqliteValues = {
      ...suggestion,
      conversationPrompts: JSON.stringify(suggestion.conversationPrompts),
    };
    
    const [activitySuggestion] = await db
      .insert(activitySuggestions)
      .values(sqliteValues)
      .returning();
    
    // Convert JSON strings back to arrays for return
    return {
      ...activitySuggestion,
      conversationPrompts: JSON.parse(activitySuggestion.conversationPrompts),
    };
  }

  async getActivitySuggestionsByEmail(email: string): Promise<ActivitySuggestion[]> {
    const suggestions = await db.select().from(activitySuggestions).where(eq(activitySuggestions.email, email));
    
    // Convert JSON strings back to arrays for all suggestions
    return suggestions.map(suggestion => ({
      ...suggestion,
      conversationPrompts: JSON.parse(suggestion.conversationPrompts),
    }));
  }
}

export const storage = new DatabaseStorage();
