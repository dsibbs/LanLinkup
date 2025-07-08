import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Geocode } from "./map";


import { setupAuth } from "./auth";
import { insertPartySchema, insertFriendshipSchema } from "@shared/schema";
import { z } from "zod";
import { Console } from "console";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Party routes
  app.post("/api/parties", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      console.log("Party creation request body:", req.body);
      const partyData = insertPartySchema.parse(req.body);
      console.log("Parsed party data:", partyData);
      const { latitude, longitude } = await Geocode(partyData.address);

      partyData.latitude=latitude;
      partyData.longitude =longitude;
      const party = await storage.createParty({
        ...partyData,
        hostId: req.user!.id,
      });
      res.json(party);
    } catch (error) {
      console.error("Party creation error:", error);
      res.status(400).json({ message: "Invalid party data", error: error.message });
    }
  });

  app.get("/api/parties", async (req, res) => {
    try {
      const { search, game, limit = "15", offset = "0", includeFinished } = req.query;
      
      if (search && typeof search === "string") {
        const parties = await storage.searchParties(
          search,
          typeof game === "string" ? game : undefined,
          parseInt(limit as string),
          parseInt(offset as string)
        );
        res.json(parties);
      } else {
        const parties = await storage.getPublicParties(
          parseInt(limit as string),
          parseInt(offset as string)
        );
        res.json(parties);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parties" });
    }
  });

  app.get("/api/parties/my", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      console.log("Fetching parties for the user ID:", req.user!.id);
      const parties = await storage.getPartiesByHost(req.user!.id);
      console.log("Found parties:", parties);
      res.json(parties);
    } catch (error) {
      console.error("Error fetching my parties:", error);
      res.status(500).json({ message: "Failed to fetch parties" });
    }
  });

  app.get("/api/parties/upcoming", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const parties = await storage.getUpcomingPartiesForUser(req.user!.id);
      res.json(parties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming parties" });
    }
  });

  app.get("/api/parties/:id", async (req, res) => {
    try {
      const party = await storage.getParty(parseInt(req.params.id));
      if (!party) return res.status(404).json({ message: "Party not found" });

      // Check if user is attending (if authenticated)
      if (req.isAuthenticated()) {
        party.isAttending = await storage.isUserAttending(party.id, req.user!.id);
      }

      res.json(party);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch party" });
    }
  });

  app.put("/api/parties/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const party = await storage.getParty(parseInt(req.params.id));
      if (!party || party.host.id !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to edit this party" });
      }

      const updates = insertPartySchema.partial().parse(req.body);
      const updatedParty = await storage.updateParty(parseInt(req.params.id), updates);
      res.json(updatedParty);
    } catch (error) {
      res.status(400).json({ message: "Invalid party data" });
    }
  });

  app.delete("/api/parties/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const party = await storage.getParty(parseInt(req.params.id));
      if (!party || party.host.id !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this party" });
      }

      const deleted = await storage.deleteParty(parseInt(req.params.id));
      if (deleted) {
        res.json({ message: "Party deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete party" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete party" });
    }
  });

  // Party attendance routes
  app.post("/api/parties/:id/join", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const attendee = await storage.joinParty(parseInt(req.params.id), req.user!.id);
      if (attendee) {
        res.json({ message: "Successfully joined party" });
      } else {
        res.status(400).json({ message: "Unable to join party (may be full or already joined)" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to join party" });
    }
  });

  app.post("/api/parties/:id/leave", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const left = await storage.leaveParty(parseInt(req.params.id), req.user!.id);
      if (left) {
        res.json({ message: "Successfully left party" });
      } else {
        res.status(400).json({ message: "Unable to leave party" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to leave party" });
    }
  });

  app.get("/api/parties/:id/attendees", async (req, res) => {
    try {
      const attendees = await storage.getPartyAttendees(parseInt(req.params.id));
      res.json(attendees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendees" });
    }
  });

  // Friend routes
  app.get("/api/friends", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const friends = await storage.getFriends(req.user!.id);
      res.json(friends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.get("/api/friend-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const requests = await storage.getFriendRequests(req.user!.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  app.get("/api/friend-requests/sent", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const requests = await storage.getSentFriendRequests(req.user!.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sent friend requests" });
    }
  });

  app.post("/api/friend-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { addresseeId } = req.body;
      if (!addresseeId || addresseeId === req.user!.id) {
        return res.status(400).json({ message: "Invalid recipient" });
      }

      const friendship = await storage.sendFriendRequest(req.user!.id, addresseeId);
      if (friendship) {
        res.json({ message: "Friend request sent" });
      } else {
        res.status(400).json({ message: "Unable to send friend request" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  app.post("/api/friend-requests/:id/accept", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const accepted = await storage.acceptFriendRequest(parseInt(req.params.id));
      if (accepted) {
        res.json({ message: "Friend request accepted" });
      } else {
        res.status(400).json({ message: "Unable to accept friend request" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to accept friend request" });
    }
  });

  app.post("/api/friend-requests/:id/decline", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const declined = await storage.declineFriendRequest(parseInt(req.params.id));
      if (declined) {
        res.json({ message: "Friend request declined" });
      } else {
        res.status(400).json({ message: "Unable to decline friend request" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to decline friend request" });
    }
  });

  // User search route
  app.get("/api/users/search", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query required" });
      }

      const users = await storage.searchUsers(q, req.user!.id);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // User profile routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      console.log("user with id");

      const user = await storage.getUserWithStats(parseInt(req.params.id));
      if (!user){ 
        return res.status(404).json({ message: "User not found" });
      }

      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    if (parseInt(req.params.id) !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized to edit this profile" });
    }

    try {
      const updateSchema = z.object({
        bio: z.string().optional(),
        location: z.string().optional(),
      });

      const updates = updateSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.user!.id, updates);
      
      if (updatedUser) {
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } else {
        res.status(500).json({ message: "Failed to update profile" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid profile data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
