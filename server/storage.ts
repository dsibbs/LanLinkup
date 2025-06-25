import { users, parties, partyAttendees, friendships, type User, type InsertUser, type Party, type InsertParty, type PartyAttendee, type InsertPartyAttendee, type Friendship, type InsertFriendship, type PartyWithHost, type UserWithStats } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, sql, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import axios from "axios";

type SessionStore = session.Store;
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  getUserWithStats(id: number): Promise<UserWithStats | undefined>;
  searchUsers(query: string, excludeUserId: number): Promise<User[]>;

  // Party methods
  createParty(party: InsertParty & { hostId: number }): Promise<Party>;
  getParty(id: number): Promise<PartyWithHost | undefined>;
  getPartiesByHost(hostId: number): Promise<PartyWithHost[]>;
  getPublicParties(limit?: number, offset?: number): Promise<PartyWithHost[]>;
  searchParties(query: string, gameFilter?: string, limit?: number, offset?: number): Promise<PartyWithHost[]>;
  updateParty(id: number, updates: Partial<InsertParty>): Promise<Party | undefined>;
  deleteParty(id: number): Promise<boolean>;
  getUpcomingPartiesForUser(userId: number): Promise<PartyWithHost[]>;

  // Party attendee methods
  joinParty(partyId: number, userId: number): Promise<PartyAttendee | null>;
  leaveParty(partyId: number, userId: number): Promise<boolean>;
  getPartyAttendees(partyId: number): Promise<User[]>;
  isUserAttending(partyId: number, userId: number): Promise<boolean>;

  // Friendship methods
  sendFriendRequest(requesterId: number, addresseeId: number): Promise<Friendship | null>;
  acceptFriendRequest(requestId: number): Promise<boolean>;
  declineFriendRequest(requestId: number): Promise<boolean>;
  getFriends(userId: number): Promise<User[]>;
  getFriendRequests(userId: number): Promise<(Friendship & { requester: User })[]>;
  getSentFriendRequests(userId: number): Promise<(Friendship & { addressee: User })[]>;
  areFriends(userId1: number, userId2: number): Promise<boolean>;
  hasPendingFriendRequest(requesterId: number, addresseeId: number): Promise<boolean>;

  sessionStore: SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async getUserWithStats(id: number): Promise<UserWithStats | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const [hostedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(parties)
      .where(eq(parties.hostId, id));

    const [attendedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(partyAttendees)
      .where(eq(partyAttendees.userId, id));

    const [friendsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(friendships)
      .where(
        and(
          or(eq(friendships.requesterId, id), eq(friendships.addresseeId, id)),
          eq(friendships.status, "accepted")
        )
      );

    return {
      ...user,
      stats: {
        partiesHosted: hostedCount.count,
        partiesAttended: attendedCount.count,
        friends: friendsCount.count,
      },
    };
  }

  async searchUsers(query: string, excludeUserId: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        and(
          or(
            ilike(users.username, `%${query}%`),
          ),
          sql`${users.id} != ${excludeUserId}`
        )
      )
      .limit(20);
  }

  // Party methods
  async createParty(party: InsertParty & { hostId: number }): Promise<Party> {


    const [newParty] = await db
      .insert(parties)
      .values(party)
      .returning();
    return newParty;
  }

  async getParty(id: number): Promise<PartyWithHost | undefined> {
    const [result] = await db
      .select({
        party: parties,
        host: users,
      })
      .from(parties)
      .innerJoin(users, eq(parties.hostId, users.id))
      .where(eq(parties.id, id));

    if (!result) return undefined;

    const [attendeeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(partyAttendees)
      .where(eq(partyAttendees.partyId, id));

    return {
      ...result.party,
      host: result.host,
      attendeeCount: attendeeCount.count,
    };
  }

  async getPartiesByHost(hostId: number): Promise<PartyWithHost[]> {
    const results = await db
      .select({
        party: parties,
        host: users,
      })
      .from(parties)
      .innerJoin(users, eq(parties.hostId, users.id))
      .where(eq(parties.hostId, hostId))
      .orderBy(desc(parties.date));

    const partiesWithCounts = await Promise.all(
      results.map(async (result) => {
        const [attendeeCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(partyAttendees)
          .where(eq(partyAttendees.partyId, result.party.id));

        return {
          ...result.party,
          host: result.host,
          attendeeCount: attendeeCount.count,
        };
      })
    );

    return partiesWithCounts;
  }

  async getPublicParties(limit = 20, offset = 0): Promise<PartyWithHost[]> {
    const results = await db
      .select({
        party: parties,
        host: users,
      })
      .from(parties)
      .innerJoin(users, eq(parties.hostId, users.id))
      .where(eq(parties.visibility, "public"))
      .orderBy(asc(parties.date))
      .limit(limit)
      .offset(offset);

    const partiesWithCounts = await Promise.all(
      results.map(async (result) => {
        const [attendeeCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(partyAttendees)
          .where(eq(partyAttendees.partyId, result.party.id));

        return {
          ...result.party,
          host: result.host,
          attendeeCount: attendeeCount.count,
        };
      })
    );

    return partiesWithCounts;
  }

  async searchParties(query: string, gameFilter?: string, limit = 20, offset = 0): Promise<PartyWithHost[]> {
    let whereClause = and(
      eq(parties.visibility, "public"),
      or(
        ilike(parties.title, `%${query}%`),
        ilike(parties.description, `%${query}%`),
        ilike(parties.location, `%${query}%`)
      )
    );

    if (gameFilter) {
      whereClause = and(whereClause, ilike(parties.game, `%${gameFilter}%`));
    }

    const results = await db
      .select({
        party: parties,
        host: users,
      })
      .from(parties)
      .innerJoin(users, eq(parties.hostId, users.id))
      .where(whereClause)
      .orderBy(asc(parties.date))
      .limit(limit)
      .offset(offset);

    const partiesWithCounts = await Promise.all(
      results.map(async (result) => {
        const [attendeeCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(partyAttendees)
          .where(eq(partyAttendees.partyId, result.party.id));

        return {
          ...result.party,
          host: result.host,
          attendeeCount: attendeeCount.count,
        };
      })
    );

    return partiesWithCounts;
  }

  async updateParty(id: number, updates: Partial<InsertParty>): Promise<Party | undefined> {
    const [party] = await db
      .update(parties)
      .set(updates)
      .where(eq(parties.id, id))
      .returning();
    return party || undefined;
  }

  async deleteParty(id: number): Promise<boolean> {
    // First delete all attendees
    await db.delete(partyAttendees).where(eq(partyAttendees.partyId, id));
    
    // Then delete the party
    const result = await db.delete(parties).where(eq(parties.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getUpcomingPartiesForUser(userId: number): Promise<PartyWithHost[]> {
    const results = await db
      .select({
        party: parties,
        host: users,
      })
      .from(partyAttendees)
      .innerJoin(parties, eq(partyAttendees.partyId, parties.id))
      .innerJoin(users, eq(parties.hostId, users.id))
      .where(
        and(
          eq(partyAttendees.userId, userId),
          sql`${parties.date} > NOW()`
        )
      )
      .orderBy(asc(parties.date));

    const partiesWithCounts = await Promise.all(
      results.map(async (result) => {
        const [attendeeCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(partyAttendees)
          .where(eq(partyAttendees.partyId, result.party.id));

        return {
          ...result.party,
          host: result.host,
          attendeeCount: attendeeCount.count,
          isAttending: true,
        };
      })
    );

    return partiesWithCounts;
  }

  // Party attendee methods
  async joinParty(partyId: number, userId: number): Promise<PartyAttendee | null> {
    try {
      // Check if party exists and has capacity
      const party = await this.getParty(partyId);
      if (!party) return null;

      // Check if user is already attending
      const isAttending = await this.isUserAttending(partyId, userId);
      if (isAttending) return null;

      // Check capacity
      if (party.attendeeCount >= party.capacity) return null;

      const [attendee] = await db
        .insert(partyAttendees)
        .values({ partyId, userId })
        .returning();
      return attendee;
    } catch (error) {
      return null;
    }
  }
  async leaveParty(partyId: number, userId: number): Promise<boolean> {
    console.log(`Attempting to remove user ${userId} from party ${partyId}`);
    const result = await db
      .delete(partyAttendees)
      .where(
        and(
          eq(partyAttendees.partyId, partyId),
          eq(partyAttendees.userId, userId)
        )
      );
    const success = (result.rowCount || 0) > 0;
    console.log(`leaveParty result for user ${userId} and party ${partyId}: ${success}`);
    return success;
  }

  async getPartyAttendees(partyId: number): Promise<User[]> {
    console.log(`Fetching attendees for party ${partyId}`);
    const results = await db
      .select({ user: users })
      .from(partyAttendees)
      .innerJoin(users, eq(partyAttendees.userId, users.id))
      .where(eq(partyAttendees.partyId, partyId));
    
    console.log(`Found ${results.length} attendees for party ${partyId}`);
    return results.map(result => result.user);
  }

  async isUserAttending(partyId: number, userId: number): Promise<boolean> {
    console.log(`Checking if user ${userId} is attending party ${partyId}`);
    const [result] = await db
      .select()
      .from(partyAttendees)
      .where(
        and(
          eq(partyAttendees.partyId, partyId),
          eq(partyAttendees.userId, userId)
        )
      );
    const attending = !!result;
    console.log(`User ${userId} attending party ${partyId}: ${attending}`);
    return attending;
  }

  async sendFriendRequest(requesterId: number, addresseeId: number): Promise<Friendship | null> {
    console.log(`Sending friend request from ${requesterId} to ${addresseeId}`);
    try {
      const existingFriendship = await db
        .select()
        .from(friendships)
        .where(
          or(
            and(
              eq(friendships.requesterId, requesterId),
              eq(friendships.addresseeId, addresseeId)
            ),
            and(
              eq(friendships.requesterId, addresseeId),
              eq(friendships.addresseeId, requesterId)
            )
          )
        );

      if (existingFriendship.length > 0) {
        console.log(`Friend request already exists between ${requesterId} and ${addresseeId}`);
        return null;
      }

      const [friendship] = await db
        .insert(friendships)
        .values({
          requesterId,
          addresseeId,
          status: "pending",
        })
        .returning();

      console.log(`Friend request created: ${JSON.stringify(friendship)}`);
      return friendship;
    } catch (error) {
      console.error(`Error sending friend request: ${error}`);
      return null;
    }
  }

  async acceptFriendRequest(requestId: number): Promise<boolean> {
    console.log(`Accepting friend request ${requestId}`);
    const result = await db
      .update(friendships)
      .set({ 
        status: "accepted",
        updatedAt: new Date()
      })
      .where(eq(friendships.id, requestId));
    
    const success = (result.rowCount || 0) > 0;
    console.log(`Friend request ${requestId} accepted: ${success}`);
    return success;
  }

  async declineFriendRequest(requestId: number): Promise<boolean> {
    console.log(`Declining friend request ${requestId}`);
    const result = await db
      .delete(friendships)
      .where(eq(friendships.id, requestId));

    const success = (result.rowCount || 0) > 0;
    console.log(`Friend request ${requestId} declined: ${success}`);
    return success;
  }


  async getFriends(userId: number): Promise<User[]> {
    const results = await db
      .select({
        friend: users,
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

    return results.map(result => result.friend);
  }

  async getFriendRequests(userId: number): Promise<(Friendship & { requester: User })[]> {
    const results = await db
      .select({
        friendship: friendships,
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

    return results.map(result => ({
      ...result.friendship,
      requester: result.requester,
    }));
  }

  async getSentFriendRequests(userId: number): Promise<(Friendship & { addressee: User })[]> {
    const results = await db
      .select({
        friendship: friendships,
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

    return results.map(result => ({
      ...result.friendship,
      addressee: result.addressee,
    }));
  }

  async areFriends(userId1: number, userId2: number): Promise<boolean> {
    const [result] = await db
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
    return !!result;
  }

  async hasPendingFriendRequest(requesterId: number, addresseeId: number): Promise<boolean> {
    const [result] = await db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.requesterId, requesterId),
          eq(friendships.addresseeId, addresseeId),
          eq(friendships.status, "pending")
        )
      );
    return !!result;
  }

}

export const storage = new DatabaseStorage();
