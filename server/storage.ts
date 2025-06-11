import { preorders, type Preorder, type InsertPreorder } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createPreorder(preorder: InsertPreorder): Promise<Preorder>;
  getPreorderByEmail(email: string): Promise<Preorder | undefined>;
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
}

export const storage = new DatabaseStorage();
