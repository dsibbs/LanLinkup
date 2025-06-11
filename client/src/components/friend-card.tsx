import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageCircle, UserMinus } from "lucide-react";
import type { User } from "@shared/schema";

interface FriendCardProps {
  friend: User;
}

const getOnlineStatus = () => {
  const statuses = ["online", "away", "offline"];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "offline":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "online":
      return "Online";
    case "away":
      return "Away";
    case "offline":
      return "Offline";
    default:
      return "Offline";
  }
};

export default function FriendCard({ friend }: FriendCardProps) {
  const status = getOnlineStatus();

  return (
    <Card className="bg-dark-tertiary border-gray-600 card-hover">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-cyan rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {friend.username[0].toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate">{friend.username}</h3>
          </div>
        </div>

        {friend.bio && (
          <p className="text-text-secondary text-xs mb-3 line-clamp-2">{friend.bio}</p>
        )}

        {friend.location && (
          <Badge variant="outline" className="mb-3 text-xs border-gray-600">
            📍 {friend.location}
          </Badge>
        )}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-dark-secondary border-gray-600 hover:bg-gray-600"
          >
            <Eye className="h-4 w-4 mr-1" />
            Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-accent-blue hover:bg-blue-600 border-accent-blue text-white"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
