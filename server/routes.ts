import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPartySchema, insertPartyRegistrationSchema, insertFriendshipSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Party routes
  app.get("/api/parties", async (req, res, next) => {
    try {
      const { game, location, visibility } = req.query;
      const parties = await storage.getParties({
        game: game as string,
        location: location as string,
        visibility: visibility as string,
      });
      res.json(parties);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/parties/:id", async (req, res, next) => {
    try {
      const party = await storage.getParty(parseInt(req.params.id));
      if (!party) {
        return res.status(404).send("Party not found");
      }
      res.json(party);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/parties", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const validatedData = insertPartySchema.parse(req.body);
      const party = await storage.createParty({
        ...validatedData,
        hostId: req.user!.id,
      });
      res.status(201).json(party);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/parties/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const partyId = parseInt(req.params.id);
      const party = await storage.getParty(partyId);
      
      if (!party) {
        return res.status(404).send("Party not found");
      }

      if (party.hostId !== req.user!.id) {
        return res.status(403).send("Only the host can edit this party");
      }

      const validatedData = insertPartySchema.partial().parse(req.body);
      const updatedParty = await storage.updateParty(partyId, validatedData);
      res.json(updatedParty);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/parties/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const partyId = parseInt(req.params.id);
      const party = await storage.getParty(partyId);
      
      if (!party) {
        return res.status(404).send("Party not found");
      }

      if (party.hostId !== req.user!.id) {
        return res.status(403).send("Only the host can delete this party");
      }

      const deleted = await storage.deleteParty(partyId);
      if (deleted) {
        res.sendStatus(200);
      } else {
        res.status(500).send("Failed to delete party");
      }
    } catch (error) {
      next(error);
    }
  });

  // User's parties
  app.get("/api/user/parties", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const parties = await storage.getUserParties(req.user!.id);
      res.json(parties);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/user/registered-parties", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const parties = await storage.getUserRegisteredParties(req.user!.id);
      res.json(parties);
    } catch (error) {
      next(error);
    }
  });

  // Party registration routes
  app.post("/api/parties/:id/register", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const partyId = parseInt(req.params.id);
      const userId = req.user!.id;

      // Check if party exists
      const party = await storage.getParty(partyId);
      if (!party) {
        return res.status(404).send("Party not found");
      }

      // Check if user is already registered
      const isRegistered = await storage.isUserRegistered(partyId, userId);
      if (isRegistered) {
        return res.status(400).send("Already registered for this party");
      }

      // Check capacity
      const registrations = await storage.getPartyRegistrations(partyId);
      if (registrations.length >= party.capacity) {
        return res.status(400).send("Party is at capacity");
      }

      const registration = await storage.registerForParty({ partyId, userId });
      res.status(201).json(registration);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/parties/:id/register", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const partyId = parseInt(req.params.id);
      const userId = req.user!.id;

      const unregistered = await storage.unregisterFromParty(partyId, userId);
      if (unregistered) {
        res.sendStatus(200);
      } else {
        res.status(400).send("Not registered for this party");
      }
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/parties/:id/registrations", async (req, res, next) => {
    try {
      const partyId = parseInt(req.params.id);
      const registrations = await storage.getPartyRegistrations(partyId);
      res.json(registrations);
    } catch (error) {
      next(error);
    }
  });

  // Friend routes
  app.get("/api/friends", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const friends = await storage.getFriends(req.user!.id);
      res.json(friends);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/friend-requests", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const requests = await storage.getFriendRequests(req.user!.id);
      res.json(requests);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/friend-requests", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const { addresseeId } = req.body;
      const requesterId = req.user!.id;

      if (requesterId === addresseeId) {
        return res.status(400).send("Cannot send friend request to yourself");
      }

      // Check if they're already friends
      const areFriends = await storage.areFriends(requesterId, addresseeId);
      if (areFriends) {
        return res.status(400).send("Already friends");
      }

      const friendship = await storage.sendFriendRequest({ requesterId, addresseeId });
      res.status(201).json(friendship);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/friend-requests/:requesterId/accept", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const requesterId = parseInt(req.params.requesterId);
      const addresseeId = req.user!.id;

      const accepted = await storage.acceptFriendRequest(requesterId, addresseeId);
      if (accepted) {
        res.sendStatus(200);
      } else {
        res.status(404).send("Friend request not found");
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/friend-requests/:requesterId/reject", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const requesterId = parseInt(req.params.requesterId);
      const addresseeId = req.user!.id;

      const rejected = await storage.rejectFriendRequest(requesterId, addresseeId);
      if (rejected) {
        res.sendStatus(200);
      } else {
        res.status(404).send("Friend request not found");
      }
    } catch (error) {
      next(error);
    }
  });

  // User search
  app.get("/api/users/search", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const { q } = req.query;
      if (!q) {
        return res.json([]);
      }

      const users = await storage.searchUsers(q as string);
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  // User profile
  app.get("/api/users/:id", async (req, res, next) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
