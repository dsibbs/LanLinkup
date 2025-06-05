import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FriendCard from "@/components/friend-card";
import { UserPlus, Search, Watch, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Friendship } from "@shared/schema";

interface FriendsProps {
  onNavigate: (view: string) => void;
}

export default function Friends({ onNavigate }: FriendsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const { toast } = useToast();

  const { data: friends = [], isLoading: friendsLoading } = useQuery<User[]>({
    queryKey: ["/api/friends"],
  });

  const { data: friendRequests = [], isLoading: requestsLoading } = useQuery<(Friendship & { requester: User })[]>({
    queryKey: ["/api/friend-requests"],
  });

  const searchUsersMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to search users");
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: async (addresseeId: number) => {
      await apiRequest("POST", "/api/friend-requests", { addresseeId });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Friend request sent successfully!",
      });
      setSearchResults([]);
      setSearchQuery("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      await apiRequest("POST", `/api/friend-requests/${requestId}/accept`);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Friend request accepted!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friend-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const declineFriendRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      await apiRequest("POST", `/api/friend-requests/${requestId}/decline`);
    },
    onSuccess: () => {
      toast({
        title: "Friend request declined",
        description: "The friend request has been declined.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/friend-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchUsersMutation.mutate(searchQuery.trim());
    }
  };

  return (
    <div className="space-y-8">
      {/* Friends Header */}
      <Card className="bg-dark-secondary border-dark-tertiary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Friends & Community</h1>
          </div>

          {/* Search Users */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Search for gamers by username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple pl-12"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
              </div>
            </div>
            <Button 
              onClick={handleSearch}
              disabled={searchUsersMutation.isPending}
              className="bg-accent-blue hover:bg-blue-600"
            >
              {searchUsersMutation.isPending ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-4">Search Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((user) => (
                  <Card key={user.id} className="bg-dark-tertiary border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-cyan rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">{user.username[0].toUpperCase()}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-primary">{user.username}</h3>
                          <p className="text-text-secondary text-sm">{user.email}</p>
                        </div>
                      </div>
                      {user.bio && (
                        <p className="text-text-secondary text-xs mb-3">{user.bio}</p>
                      )}
                      <Button
                        onClick={() => sendFriendRequestMutation.mutate(user.id)}
                        disabled={sendFriendRequestMutation.isPending}
                        className="w-full bg-accent-purple hover:bg-purple-600"
                        size="sm"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Send Request
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <Card className="bg-dark-secondary border-dark-tertiary">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Watch className="h-6 w-6 mr-3 text-accent-purple" />
              Friend Requests
              <span className="ml-2 bg-accent-purple text-white text-xs px-2 py-1 rounded-full">
                {friendRequests.length}
              </span>
            </h2>

            <div className="space-y-4">
              {friendRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between bg-dark-tertiary rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-cyan rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{request.requester.username[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{request.requester.username}</h3>
                      <p className="text-text-secondary text-sm">Sent you a friend request</p>
                      <p className="text-text-secondary text-xs">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => acceptFriendRequestMutation.mutate(request.id)}
                      disabled={acceptFriendRequestMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => declineFriendRequestMutation.mutate(request.id)}
                      disabled={declineFriendRequestMutation.isPending}
                      variant="destructive"
                      size="sm"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card className="bg-dark-secondary border-dark-tertiary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Users className="h-6 w-6 mr-3 text-accent-cyan" />
              My Friends
              <span className="ml-2 text-text-secondary text-sm">({friends.length} friends)</span>
            </h2>
          </div>

          {friendsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-dark-tertiary rounded-lg p-4 animate-pulse">
                  <div className="h-20 bg-gray-600 rounded mb-4"></div>
                  <div className="h-4 bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No friends yet</h3>
              <p className="text-text-secondary mb-4">Start building your gaming network by searching for fellow gamers!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
