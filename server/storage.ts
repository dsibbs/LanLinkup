import { 
  users, 
  parties, 
  partyRegistrations, 
  friendships,
  type User, 
  type InsertUser,
  type Party,
  type InsertParty,
  type PartyRegistration,
  type InsertPartyRegistration,
  type Friendship,
  type InsertFriendship
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  searchUsers(query: string): Promise<User[]>;

  // Party operations
  getParty(id: number): Promise<Party | undefined>;
  getParties(filters?: {
    game?: string;
    location?: string;
    visibility?: string;
    hostId?: number;
  }): Promise<Array<Party & { host: User; registrationCount: number }>>;
  createParty(party: InsertParty & { hostId: number }): Promise<Party>;
  updateParty(id: number, updates: Partial<InsertParty>): Promise<Party | undefined>;
  deleteParty(id: number): Promise<boolean>;
  getUserParties(userId: number): Promise<Array<Party & { registrationCount: number }>>;
  getUserRegisteredParties(userId: number): Promise<Array<Party & { host: User }>>;

  // Party registration operations
  registerForParty(registration: InsertPartyRegistration): Promise<PartyRegistration>;
  unregisterFromParty(partyId: number, userId: number): Promise<boolean>;
  getPartyRegistrations(partyId: number): Promise<Array<PartyRegistration & { user: User }>>;
  isUserRegistered(partyId: number, userId: number): Promise<boolean>;

  // Friendship operations
  sendFriendRequest(friendship: InsertFriendship): Promise<Friendship>;
  acceptFriendRequest(requesterId: number, addresseeId: number): Promise<boolean>;
  rejectFriendRequest(requesterId: number, addresseeId: number): Promise<boolean>;
  getFriends(userId: number): Promise<User[]>;
  getFriendRequests(userId: number): Promise<Array<Friendship & { requester: User }>>;
  getSentFriendRequests(userId: number): Promise<Array<Friendship & { addressee: User }>>;
  areFriends(userId1: number, userId2: number): Promise<boolean>;

  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async searchUsers(query: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.username, `%${query}%`),
          ilike(users.email, `%${query}%`)
        )
      )
      .limit(10);
  }

  // Party operations
  async getParty(id: number): Promise<Party | undefined> {
    const [party] = await db.select().from(parties).where(eq(parties.id, id));
    return party || undefined;
  }

  async getParties(filters?: {
    game?: string;
    location?: string;
    visibility?: string;
    hostId?: number;
  }): Promise<Array<Party & { host: User; registrationCount: number }>> {
    let query = db
      .select({
        id: parties.id,
        title: parties.title,
        description: parties.description,
        game: parties.game,
        capacity: parties.capacity,
        location: parties.location,
        fullAddress: parties.fullAddress,
        visibility: parties.visibility,
        hostId: parties.hostId,
        eventDate: parties.eventDate,
        createdAt: parties.createdAt,
        host: users,
        registrationCount: sql<number>`CAST(COUNT(${partyRegistrations.id}) AS INTEGER)`,
      })
      .from(parties)
      .innerJoin(users, eq(parties.hostId, users.id))
      .leftJoin(partyRegistrations, eq(parties.id, partyRegistrations.partyId))
      .groupBy(parties.id, users.id);

    if (filters?.game) {
      query = query.where(ilike(parties.game, `%${filters.game}%`));
    }
    if (filters?.location) {
      query = query.where(ilike(parties.location, `%${filters.location}%`));
    }
    if (filters?.visibility) {
      query = query.where(eq(parties.visibility, filters.visibility as any));
    }
    if (filters?.hostId) {
      query = query.where(eq(parties.hostId, filters.hostId));
    }

    return await query.orderBy(desc(parties.createdAt));
  }

  async createParty(party: InsertParty & { hostId: number }): Promise<Party> {
    const [newParty] = await db
      .insert(parties)
      .values({
        ...party,
        eventDate: new Date(party.eventDate),
      })
      .returning();
    return newParty;
  }

  async updateParty(id: number, updates: Partial<InsertParty>): Promise<Party | undefined> {
    const updateData: any = { ...updates };
    if (updateData.eventDate) {
      updateData.eventDate = new Date(updateData.eventDate);
    }
    
    const [party] = await db
      .update(parties)
      .set(updateData)
      .where(eq(parties.id, id))
      .returning();
    return party || undefined;
  }

  async deleteParty(id: number): Promise<boolean> {
    // First delete registrations
    await db.delete(partyRegistrations).where(eq(partyRegistrations.partyId, id));
    // Then delete party
    const result = await db.delete(parties).where(eq(parties.id, id));
    return result.rowCount > 0;
  }

  async getUserParties(userId: number): Promise<Array<Party & { registrationCount: number }>> {
    return await db
      .select({
        id: parties.id,
        title: parties.title,
        description: parties.description,
        game: parties.game,
        capacity: parties.capacity,
        location: parties.location,
        fullAddress: parties.fullAddress,
        visibility: parties.visibility,
        hostId: parties.hostId,
        eventDate: parties.eventDate,
        createdAt: parties.createdAt,
        registrationCount: sql<number>`CAST(COUNT(${partyRegistrations.id}) AS INTEGER)`,
      })
      .from(parties)
      .leftJoin(partyRegistrations, eq(parties.id, partyRegistrations.partyId))
      .where(eq(parties.hostId, userId))
      .groupBy(parties.id)
      .orderBy(desc(parties.createdAt));
  }

  async getUserRegisteredParties(userId: number): Promise<Array<Party & { host: User }>> {
    return await db
      .select({
        id: parties.id,
        title: parties.title,
        description: parties.description,
        game: parties.game,
        capacity: parties.capacity,
        location: parties.location,
        fullAddress: parties.fullAddress,
        visibility: parties.visibility,
        hostId: parties.hostId,
        eventDate: parties.eventDate,
        createdAt: parties.createdAt,
        host: users,
      })
      .from(partyRegistrations)
      .innerJoin(parties, eq(partyRegistrations.partyId, parties.id))
      .innerJoin(users, eq(parties.hostId, users.id))
      .where(eq(partyRegistrations.userId, userId))
      .orderBy(desc(parties.eventDate));
  }

  // Party registration operations
  async registerForParty(registration: InsertPartyRegistration): Promise<PartyRegistration> {
    const [newRegistration] = await db
      .insert(partyRegistrations)
      .values(registration)
      .returning();
    return newRegistration;
  }

  async unregisterFromParty(partyId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(partyRegistrations)
      .where(
        and(
          eq(partyRegistrations.partyId, partyId),
          eq(partyRegistrations.userId, userId)
        )
      );
    return result.rowCount > 0;
  }

  async getPartyRegistrations(partyId: number): Promise<Array<PartyRegistration & { user: User }>> {
    return await db
      .select({
        id: partyRegistrations.id,
        partyId: partyRegistrations.partyId,
        userId: partyRegistrations.userId,
        registeredAt: partyRegistrations.registeredAt,
        user: users,
      })
      .from(partyRegistrations)
      .innerJoin(users, eq(partyRegistrations.userId, users.id))
      .where(eq(partyRegistrations.partyId, partyId));
  }

  async isUserRegistered(partyId: number, userId: number): Promise<boolean> {
    const [registration] = await db
      .select()
      .from(partyRegistrations)
      .where(
        and(
          eq(partyRegistrations.partyId, partyId),
          eq(partyRegistrations.userId, userId)
        )
      );
    return !!registration;
  }

  // Friendship operations
  async sendFriendRequest(friendship: InsertFriendship): Promise<Friendship> {
    const [newFriendship] = await db
      .insert(friendships)
      .values(friendship)
      .returning();
    return newFriendship;
  }

  async acceptFriendRequest(requesterId: number, addresseeId: number): Promise<boolean> {
    const result = await db
      .update(friendships)
      .set({ 
        status: "accepted",
        acceptedAt: new Date()
      })
      .where(
        and(
          eq(friendships.requesterId, requesterId),
          eq(friendships.addresseeId, addresseeId),
          eq(friendships.status, "pending")
        )
      );
    return result.rowCount > 0;
  }

  async rejectFriendRequest(requesterId: number, addresseeId: number): Promise<boolean> {
    const result = await db
      .delete(friendships)
      .where(
        and(
          eq(friendships.requesterId, requesterId),
          eq(friendships.addresseeId, addresseeId),
          eq(friendships.status, "pending")
        )
      );
    return result.rowCount > 0;
  }

  async getFriends(userId: number): Promise<User[]> {
    const friends = await db
      .select({
        user: users,
      })
      .from(friendships)
      .innerJoin(
        users,
        or(
          and(
            eq(friendships.requesterId, userId),
            eq(users.id, friendships.addresseeId)
          ),
          and(
            eq(friendships.addresseeId, userId),
            eq(users.id, friendships.requesterId)
          )
        )
      )
      .where(eq(friendships.status, "accepted"));

    return friends.map(f => f.user);
  }

  async getFriendRequests(userId: number): Promise<Array<Friendship & { requester: User }>> {
    return await db
      .select({
        id: friendships.id,
        requesterId: friendships.requesterId,
        addresseeId: friendships.addresseeId,
        status: friendships.status,
        createdAt: friendships.createdAt,
        acceptedAt: friendships.acceptedAt,
        requester: users,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.requesterId, users.id))
      .where(
        and(
          eq(friendships.addresseeId, userId),
          eq(friendships.status, "pending")
        )
      );
  }

  async getSentFriendRequests(userId: number): Promise<Array<Friendship & { addressee: User }>> {
    return await db
      .select({
        id: friendships.id,
        requesterId: friendships.requesterId,
        addresseeId: friendships.addresseeId,
        status: friendships.status,
        createdAt: friendships.createdAt,
        acceptedAt: friendships.acceptedAt,
        addressee: users,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.addresseeId, users.id))
      .where(
        and(
          eq(friendships.requesterId, userId),
          eq(friendships.status, "pending")
        )
      );
  }

  async areFriends(userId1: number, userId2: number): Promise<boolean> {
    const [friendship] = await db
      .select()
      .from(friendships)
      .where(
        and(
          or(
            and(
              eq(friendships.requesterId, userId1),
              eq(friendships.addresseeId, userId2)
            ),
            and(
              eq(friendships.requesterId, userId2),
              eq(friendships.addresseeId, userId1)
            )
          ),
          eq(friendships.status, "accepted")
        )
      );
    return !!friendship;
  }
}

export const storage = new DatabaseStorage();
