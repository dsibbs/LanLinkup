import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Users, Edit, Trash2, UserPlus, Eye, Lock, Globe } from "lucide-react";
import type { PartyWithHost } from "@shared/schema";

interface PartyCardProps {
  party: PartyWithHost;
  showEditActions: boolean;
  onJoin: () => void;
  onEdit: () => void;
  onCancel: () => void;
  isJoining?: boolean;
}

const getGameIcon = (game: string) => {
  const gameIcons: Record<string, string> = {
    "Counter-Strike 2": "🎯",
    "Valorant": "🎮",
    "League of Legends": "🎧",
    "Dota 2": "⚔️",
    "Overwatch 2": "🚀",
    "Apex Legends": "💥",
    "Need for Speed Heat": "🏎️",
    "Age of Empires IV": "♟️",
  };
  return gameIcons[game] || "🎮";
};

const getVisibilityIcon = (visibility: string) => {
  switch (visibility) {
    case "public":
      return <Globe className="h-4 w-4" />;
    case "friends":
      return <Users className="h-4 w-4" />;
    case "private":
      return <Lock className="h-4 w-4" />;
    default:
      return <Globe className="h-4 w-4" />;
  }
};

const getVisibilityColor = (visibility: string) => {
  switch (visibility) {
    case "public":
      return "bg-green-600 text-green-100";
    case "friends":
      return "bg-blue-600 text-blue-100";
    case "private":
      return "bg-gray-600 text-gray-100";
    default:
      return "bg-green-600 text-green-100";
  }
};

const getStatusBadge = (party: PartyWithHost) => {
  const now = new Date();
  const partyDate = new Date(party.date);
  
  if (partyDate < now) {
    return <Badge className="bg-gray-600 text-gray-100">Completed</Badge>;
  } else if (party.attendeeCount >= party.capacity) {
    return <Badge className="bg-red-600 text-red-100">Full</Badge>;
  } else {
    return <Badge className="bg-green-600 text-green-100">Open</Badge>;
  }
};

export default function PartyCard({ 
  party, 
  showEditActions, 
  onJoin, 
  onEdit, 
  onCancel,
  isJoining = false 
}: PartyCardProps) {
  const capacityPercentage = (party.attendeeCount / party.capacity) * 100;
  const isFull = party.attendeeCount >= party.capacity;
  const isPast = new Date(party.date) < new Date();

  return (
    <Card className="bg-dark-tertiary border-gray-600 card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg flex items-center justify-center text-2xl">
              {getGameIcon(party.game)}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-text-primary">{party.title}</h3>
              <p className="text-text-secondary text-sm">{party.game}</p>
              {!showEditActions && (
                <p className="text-accent-purple text-sm font-medium">
                  Hosted by {party.host.username}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(party)}
            <Badge className={getVisibilityColor(party.visibility)}>
              {getVisibilityIcon(party.visibility)}
              <span className="ml-1 capitalize">{party.visibility}</span>
            </Badge>
          </div>
        </div>
        
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">{party.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-text-secondary">
            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{party.attendeeCount}/{party.capacity} players</span>
          </div>
          <div className="flex items-center text-sm text-text-secondary">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              {new Date(party.date).toLocaleDateString()} at{" "}
              {new Date(party.date).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <div className="flex items-center text-sm text-text-secondary">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{party.location}</span>
          </div>
        </div>
        
        {/* Progress bar for capacity */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-text-secondary mb-1">
            <span>Capacity</span>
            <span>{party.attendeeCount}/{party.capacity}</span>
          </div>
          <Progress 
            value={capacityPercentage} 
            className="h-2 bg-dark-secondary"
          />
        </div>
        
        {showEditActions ? (
          <div className="flex space-x-3">
            <Button
              onClick={onEdit}
              className="flex-1 bg-accent-blue hover:bg-blue-600"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={onCancel}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex space-x-3">
            {party.visibility === "private" || party.visibility === "friends" ? (
              <Button
                disabled
                className="flex-1 bg-gray-600 cursor-not-allowed opacity-50"
                size="sm"
              >
                <Lock className="h-4 w-4 mr-2" />
                {party.visibility === "friends" ? "Friends Only" : "Private"}
              </Button>
            ) : isPast ? (
              <Button
                disabled
                className="flex-1 bg-gray-600 cursor-not-allowed opacity-50"
                size="sm"
              >
                Event Ended
              </Button>
            ) : isFull ? (
              <Button
                disabled
                className="flex-1 bg-gray-600 cursor-not-allowed opacity-50"
                size="sm"
              >
                Party Full
              </Button>
            ) : party.isAttending ? (
              <Button
                disabled
                className="flex-1 bg-green-600 cursor-not-allowed opacity-75"
                size="sm"
              >
                ✓ Joined
              </Button>
            ) : (
              <Button
                onClick={onJoin}
                disabled={isJoining}
                className="flex-1 bg-accent-purple hover:bg-purple-600"
                size="sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isJoining ? "Joining..." : "Join Party"}
              </Button>
            )}
            <Button
              variant="outline"
              className="bg-dark-secondary border-gray-600 hover:bg-gray-600"
              size="sm"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
