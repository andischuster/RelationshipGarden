import { users, type User, type InsertUser, type Preorder, type InsertPreorder } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPreorder(preorder: InsertPreorder): Promise<Preorder>;
  getPreorderByEmail(email: string): Promise<Preorder | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private preorders: Map<number, Preorder>;
  currentId: number;
  currentPreorderId: number;

  constructor() {
    this.users = new Map();
    this.preorders = new Map();
    this.currentId = 1;
    this.currentPreorderId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPreorder(insertPreorder: InsertPreorder): Promise<Preorder> {
    const id = this.currentPreorderId++;
    const createdAt = new Date().toISOString();
    const preorder: Preorder = { ...insertPreorder, id, createdAt };
    this.preorders.set(id, preorder);
    return preorder;
  }

  async getPreorderByEmail(email: string): Promise<Preorder | undefined> {
    return Array.from(this.preorders.values()).find(
      (preorder) => preorder.email === email,
    );
  }
}

export const storage = new MemStorage();
