import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  bio: text("bio").default(""),
  location: varchar("location", { length: 100 }).default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parties = pgTable("parties", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description").notNull(),
  game: varchar("game", { length: 100 }).notNull(),
  capacity: integer("capacity").notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  address: text("address").notNull(),
  visibility: varchar("visibility", { length: 20 }).notNull(), // public, friends, private
  date: timestamp("date").notNull(),
  hostId: integer("host_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const partyAttendees = pgTable("party_attendees", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull().references(() => parties.id),
  userId: integer("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  addresseeId: integer("addressee_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  hostedParties: many(parties),
  partyAttendees: many(partyAttendees),
  sentFriendRequests: many(friendships, { relationName: "sentFriendRequests" }),
  receivedFriendRequests: many(friendships, { relationName: "receivedFriendRequests" }),
}));

export const partiesRelations = relations(parties, ({ one, many }) => ({
  host: one(users, {
    fields: [parties.hostId],
    references: [users.id],
  }),
  attendees: many(partyAttendees),
}));

export const partyAttendeesRelations = relations(partyAttendees, ({ one }) => ({
  party: one(parties, {
    fields: [partyAttendees.partyId],
    references: [parties.id],
  }),
  user: one(users, {
    fields: [partyAttendees.userId],
    references: [users.id],
  }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: "sentFriendRequests",
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: "receivedFriendRequests",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPartySchema = createInsertSchema(parties).omit({
  id: true,
  hostId: true,
  createdAt: true,
}).extend({
  date: z.string().transform((val) => new Date(val)),
});

export const insertPartyAttendeeSchema = createInsertSchema(partyAttendees).omit({
  id: true,
  joinedAt: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Party = typeof parties.$inferSelect;
export type InsertParty = z.infer<typeof insertPartySchema>;
export type PartyAttendee = typeof partyAttendees.$inferSelect;
export type InsertPartyAttendee = z.infer<typeof insertPartyAttendeeSchema>;
export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;

// Extended types for API responses
export type PartyWithHost = Party & {
  host: User;
  attendeeCount: number;
  isAttending?: boolean;
};

export type UserWithStats = User & {
  stats: {
    partiesHosted: number;
    partiesAttended: number;
    friends: number;
  };
};
