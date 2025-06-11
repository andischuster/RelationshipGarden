import { users, preorders, type User, type InsertUser, type Preorder, type InsertPreorder } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPreorder(preorder: InsertPreorder): Promise<Preorder>;
  getPreorderByEmail(email: string): Promise<Preorder | undefined>;
  getAllPreorders(): Promise<Preorder[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

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

  async getAllPreorders(): Promise<Preorder[]> {
    return await db.select().from(preorders);
  }
}

export const storage = new DatabaseStorage();
