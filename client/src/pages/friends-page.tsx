import { useState } from "react";
import { useQuery, useMutation, queryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  Search, 
  MessageCircle, 
  Send, 
  UserMinus, 
  Check, 
  X,
  UserSearch
} from "lucide-react";

export default function FriendsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const { data: friends, isLoading: loadingFriends } = useQuery({
    queryKey: ["/api/friends"],
  });

  const { data: friendRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["/api/friends/requests"],
  });

  const { data: searchResults } = useQuery({
    queryKey: ["/api/users/search", { q: userSearchQuery }],
    queryFn: async () => {
      if (!userSearchQuery.trim()) return [];
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(userSearchQuery)}`);
      if (!response.ok) throw new Error("Failed to search users");
      return response.json();
    },
    enabled: userSearchQuery.length > 2,
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: async (addresseeId: number) => {
      await apiRequest("POST", "/api/friends/request", { addresseeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      toast({
        title: "Success",
        description: "Friend request sent!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number; status: "accepted" | "declined" }) => {
      await apiRequest("PUT", `/api/friends/request/${requestId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      toast({
        title: "Success",
        description: "Friend request updated!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friendId: number) => {
      await apiRequest("DELETE", `/api/friends/${friendId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      toast({
        title: "Success",
        description: "Friend removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const filteredFriends = friends?.filter((friend: any) =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gaming-darker">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gaming-text mb-4">Gaming Friends</h1>
          <p className="text-xl text-gaming-text-muted">Connect with fellow gamers and build your squad</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Friends List */}
          <div className="lg:col-span-2">
            <Card className="bg-gaming-card border-gaming-blue/20 gaming-card-shadow">
              <CardHeader className="border-b border-gaming-blue/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gaming-text">Your Gaming Squad</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gaming-text-muted" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search friends..."
                        className="pl-10 bg-gaming-dark border-gaming-blue/30 text-gaming-text placeholder-gaming-text-muted focus:border-gaming-blue w-48"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {loadingFriends ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gaming-dark rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredFriends.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFriends.map((friend: any) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between p-4 bg-gaming-dark rounded-xl hover:bg-gaming-dark/80 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="gaming-gradient text-white font-semibold">
                                {getInitials(friend.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gaming-green rounded-full border-2 border-gaming-dark"></div>
                          </div>
                          <div>
                            <h4 className="text-gaming-text font-semibold">{friend.username}</h4>
                            <p className="text-gaming-text-muted text-sm">Online • Playing Games</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gaming-text-muted hover:text-gaming-blue"
                            title="Send Message"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gaming-text-muted hover:text-gaming-green"
                            title="Invite to Party"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gaming-text-muted hover:text-red-400"
                            title="Remove Friend"
                            onClick={() => {
                              if (confirm(`Remove ${friend.username} from your friends?`)) {
                                removeFriendMutation.mutate(friend.id);
                              }
                            }}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-gaming-dark border-gaming-blue/20 text-center p-12">
                    <CardContent>
                      <Users className="h-16 w-16 text-gaming-text-muted mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gaming-text mb-2">No Friends Yet</h3>
                      <p className="text-gaming-text-muted">
                        Start building your gaming network by adding friends!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Friend Requests */}
            <Card className="bg-gaming-card border-gaming-green/20 gaming-card-shadow">
              <CardHeader className="border-b border-gaming-green/20">
                <CardTitle className="text-gaming-text">Friend Requests</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loadingRequests ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-12 bg-gaming-dark rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : friendRequests && friendRequests.length > 0 ? (
                  <div className="space-y-4">
                    {friendRequests.map((request: any) => (
                      <div key={request.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="gaming-gradient-purple text-white font-semibold text-sm">
                              {getInitials(request.requester.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="text-gaming-text font-medium text-sm">{request.requester.username}</h4>
                            <p className="text-gaming-text-muted text-xs">Wants to be friends</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 text-gaming-green hover:bg-gaming-green hover:text-white rounded"
                            onClick={() => respondToRequestMutation.mutate({ requestId: request.id, status: "accepted" })}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 text-red-400 hover:bg-red-400 hover:text-white rounded"
                            onClick={() => respondToRequestMutation.mutate({ requestId: request.id, status: "declined" })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gaming-text-muted text-sm text-center">No pending requests</p>
                )}
              </CardContent>
            </Card>

            {/* Find Friends */}
            <Card className="bg-gaming-card border-gaming-purple/20 gaming-card-shadow">
              <CardHeader className="border-b border-gaming-purple/20">
                <CardTitle className="text-gaming-text">Find Gamers</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <UserSearch className="absolute left-3 top-3 h-4 w-4 text-gaming-text-muted" />
                    <Input
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Search by username..."
                      className="pl-10 bg-gaming-dark border-gaming-purple/30 text-gaming-text placeholder-gaming-text-muted focus:border-gaming-purple"
                    />
                  </div>
                  
                  {searchResults && searchResults.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-gaming-text font-medium text-sm">Search Results</h4>
                      {searchResults.map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="gaming-gradient-purple text-white font-semibold text-xs">
                                {getInitials(user.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h5 className="text-gaming-text font-medium text-sm">{user.username}</h5>
                              <p className="text-gaming-text-muted text-xs">{user.email}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 text-gaming-blue hover:bg-gaming-blue hover:text-white rounded"
                            onClick={() => sendFriendRequestMutation.mutate(user.id)}
                            disabled={sendFriendRequestMutation.isPending}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
