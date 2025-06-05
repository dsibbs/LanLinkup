import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  bio: text("bio"),
  favoriteGames: text("favorite_games").array(),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parties = pgTable("parties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  game: text("game").notNull(),
  capacity: integer("capacity").notNull(),
  location: text("location").notNull(),
  fullAddress: text("full_address").notNull(),
  visibility: varchar("visibility", { length: 20 }).notNull().default("public"),
  hostId: integer("host_id").notNull(),
  eventDate: timestamp("event_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const partyRegistrations = pgTable("party_registrations", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull(),
  userId: integer("user_id").notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull(),
  addresseeId: integer("addressee_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  acceptedAt: timestamp("accepted_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  hostedParties: many(parties),
  partyRegistrations: many(partyRegistrations),
  sentFriendRequests: many(friendships, { relationName: "requester" }),
  receivedFriendRequests: many(friendships, { relationName: "addressee" }),
}));

export const partiesRelations = relations(parties, ({ one, many }) => ({
  host: one(users, {
    fields: [parties.hostId],
    references: [users.id],
  }),
  registrations: many(partyRegistrations),
}));

export const partyRegistrationsRelations = relations(partyRegistrations, ({ one }) => ({
  party: one(parties, {
    fields: [partyRegistrations.partyId],
    references: [parties.id],
  }),
  user: one(users, {
    fields: [partyRegistrations.userId],
    references: [users.id],
  }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: "addressee",
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertPartySchema = createInsertSchema(parties).omit({
  id: true,
  hostId: true,
  createdAt: true,
}).extend({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required"),
  game: z.string().min(1, "Game is required"),
  capacity: z.number().min(2, "Capacity must be at least 2").max(100, "Capacity cannot exceed 100"),
  location: z.string().min(1, "Location is required"),
  fullAddress: z.string().min(1, "Full address is required"),
  visibility: z.enum(["public", "private", "friends_only"]),
  eventDate: z.string().refine((date) => new Date(date) > new Date(), "Event date must be in the future"),
});

export const insertPartyRegistrationSchema = createInsertSchema(partyRegistrations).omit({
  id: true,
  registeredAt: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
  status: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Party = typeof parties.$inferSelect;
export type InsertParty = z.infer<typeof insertPartySchema>;
export type PartyRegistration = typeof partyRegistrations.$inferSelect;
export type InsertPartyRegistration = z.infer<typeof insertPartyRegistrationSchema>;
export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
