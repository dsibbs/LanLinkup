import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navigation from "@/components/navigation";
import PartyCard from "@/components/party-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, MessageCircle, Flag, Trophy, Calendar, Users, Gamepad2 } from "lucide-react";
import { useRoute } from "wouter";

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const [match, params] = useRoute("/profile/:id");
  const userId = params?.id ? parseInt(params.id) : null;

  const { data: profileUser, isLoading: loadingUser } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  const { data: userParties, isLoading: loadingParties } = useQuery({
    queryKey: [`/api/users/${userId}/parties`],
    enabled: !!userId,
  });

  const { data: userRegistrations, isLoading: loadingRegistrations } = useQuery({
    queryKey: [`/api/users/${userId}/registrations`],
    enabled: !!userId,
  });

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const isOwnProfile = currentUser?.id === userId;

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gaming-darker">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-gaming-dark rounded-t-2xl"></div>
            <div className="bg-gaming-card p-6 rounded-b-2xl">
              <div className="h-8 bg-gaming-dark rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gaming-dark rounded"></div>
                <div className="h-4 bg-gaming-dark rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gaming-darker">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-gaming-card border-gaming-blue/20 text-center p-12">
            <CardContent>
              <h1 className="text-2xl font-bold text-gaming-text mb-2">User Not Found</h1>
              <p className="text-gaming-text-muted">The user you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-darker">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-gaming-card border-gaming-purple/20 gaming-card-shadow overflow-hidden">
          {/* Profile Header */}
          <div className="relative">
            <div className="h-48 gaming-gradient"></div>
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute bottom-6 left-6 flex items-end space-x-4">
              <Avatar className="w-24 h-24 border-4 border-gaming-card">
                <AvatarFallback className="gaming-gradient text-white text-2xl font-bold">
                  {getInitials(profileUser.username)}
                </AvatarFallback>
              </Avatar>
              <div className="pb-2">
                <h2 className="text-2xl font-bold text-white">{profileUser.username}</h2>
                <p className="text-gaming-text-muted">@{profileUser.username.toLowerCase()}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gaming-text mb-3">About</h3>
                  <p className="text-gaming-text-muted">
                    {profileUser.bio || "This gamer hasn't written a bio yet."}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gaming-text mb-3">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gaming-dark rounded-lg">
                      <Trophy className="h-5 w-5 text-gaming-blue" />
                      <span className="text-gaming-text-muted text-sm">Member since {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    {userParties && userParties.length > 0 && (
                      <div className="flex items-center space-x-3 p-3 bg-gaming-dark rounded-lg">
                        <Calendar className="h-5 w-5 text-gaming-green" />
                        <span className="text-gaming-text-muted text-sm">Hosted {userParties.length} gaming event{userParties.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* User's Parties */}
                {userParties && userParties.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gaming-text mb-3">Hosted Events</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {userParties.slice(0, 3).map((party: any) => (
                        <Card key={party.id} className="bg-gaming-dark border-gaming-blue/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-gaming-text font-semibold">{party.title}</h4>
                                <p className="text-gaming-text-muted text-sm">
                                  {party.game} • {new Date(party.date).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge 
                                variant={new Date(party.date) > new Date() ? "default" : "secondary"}
                                className={new Date(party.date) > new Date() 
                                  ? "bg-gaming-green/20 text-gaming-green" 
                                  : "bg-gaming-text-muted/20 text-gaming-text-muted"
                                }
                              >
                                {new Date(party.date) > new Date() ? "Upcoming" : "Past"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                <Card className="bg-gaming-dark border-gaming-blue/20">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-gaming-text mb-4">Gaming Stats</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gaming-text-muted text-sm">Parties Hosted</span>
                        <span className="text-gaming-blue font-semibold">
                          {userParties?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gaming-text-muted text-sm">Parties Attended</span>
                        <span className="text-gaming-green font-semibold">
                          {userRegistrations?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gaming-text-muted text-sm">Member Since</span>
                        <span className="text-gaming-text font-semibold">
                          {new Date(profileUser.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!isOwnProfile && (
                  <Card className="bg-gaming-dark border-gaming-purple/20">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-gaming-text mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Button className="w-full bg-gaming-blue/20 text-gaming-blue hover:bg-gaming-blue hover:text-white">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Friend
                        </Button>
                        <Button className="w-full bg-gaming-green/20 text-gaming-green hover:bg-gaming-green hover:text-white">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Send Message
                        </Button>
                        <Button className="w-full bg-gaming-purple/20 text-gaming-purple hover:bg-gaming-purple hover:text-white">
                          <Flag className="mr-2 h-4 w-4" />
                          Report User
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
