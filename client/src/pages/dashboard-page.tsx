import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Trophy, Clock, Plus, Edit, Trash2 } from "lucide-react";
import Navigation from "@/components/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data: myParties = [] } = useQuery({
    queryKey: ["/api/user/parties"],
  });

  const { data: registeredParties = [] } = useQuery({
    queryKey: ["/api/user/registered-parties"],
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["/api/friends"],
  });

  const getStatusColor = (eventDate: string) => {
    const now = new Date();
    const eventTime = new Date(eventDate);
    const diffHours = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return "bg-red-500/20 text-red-500";
    if (diffHours < 24) return "bg-yellow-500/20 text-yellow-500";
    return "bg-gaming-green/20 text-gaming-green";
  };

  const getStatusText = (eventDate: string) => {
    const now = new Date();
    const eventTime = new Date(eventDate);
    const diffHours = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return "Completed";
    if (diffHours < 24) return "Starting Soon";
    return "Upcoming";
  };

  const upcomingEvents = [...myParties, ...registeredParties].filter(party => 
    new Date(party.eventDate) > new Date()
  ).length;

  return (
    <div className="min-h-screen bg-gaming-darker">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gaming-text mb-4">Gaming Dashboard</h1>
          <p className="text-xl text-gaming-text-muted">Manage your parties and gaming activities</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gaming-card border-gaming-blue/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gaming-text-muted text-sm">Parties Hosted</p>
                  <p className="text-2xl font-bold text-gaming-blue">{myParties.length}</p>
                </div>
                <Calendar className="text-gaming-blue text-2xl h-8 w-8" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gaming-card border-gaming-green/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gaming-text-muted text-sm">Parties Attended</p>
                  <p className="text-2xl font-bold text-gaming-green">{registeredParties.length}</p>
                </div>
                <Trophy className="text-gaming-green text-2xl h-8 w-8" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gaming-card border-gaming-purple/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gaming-text-muted text-sm">Gaming Friends</p>
                  <p className="text-2xl font-bold text-gaming-purple">{friends.length}</p>
                </div>
                <Users className="text-gaming-purple text-2xl h-8 w-8" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gaming-card border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gaming-text-muted text-sm">Upcoming Events</p>
                  <p className="text-2xl font-bold text-yellow-500">{upcomingEvents}</p>
                </div>
                <Clock className="text-yellow-500 text-2xl h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Card className="bg-gaming-card border-gaming-blue/20 shadow-gaming-card">
          <Tabs defaultValue="my-parties" className="w-full">
            <div className="border-b border-gaming-blue/20">
              <TabsList className="bg-transparent border-b-0 h-auto p-0">
                <TabsTrigger 
                  value="my-parties" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-gaming-blue data-[state=active]:bg-transparent data-[state=active]:text-gaming-blue rounded-none border-b-2 border-transparent px-6 py-4"
                >
                  My Parties
                </TabsTrigger>
                <TabsTrigger 
                  value="registered" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-gaming-blue data-[state=active]:bg-transparent data-[state=active]:text-gaming-blue rounded-none border-b-2 border-transparent px-6 py-4"
                >
                  Registered Events
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-gaming-blue data-[state=active]:bg-transparent data-[state=active]:text-gaming-blue rounded-none border-b-2 border-transparent px-6 py-4"
                >
                  Party History
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="my-parties" className="p-6">
              <div className="space-y-4">
                {myParties.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gaming-card rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-gaming-text-muted" />
                    </div>
                    <h3 className="text-xl font-semibold text-gaming-text mb-2">No parties hosted yet</h3>
                    <p className="text-gaming-text-muted mb-4">
                      Create your first LAN party and start bringing gamers together!
                    </p>
                    <Link href="/create">
                      <Button className="bg-gradient-to-r from-gaming-blue to-gaming-green">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Party
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {myParties.map((party) => (
                      <Card key={party.id} className="bg-gaming-dark border-gaming-blue/20 hover:border-gaming-blue/40 transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-gaming-blue to-gaming-green rounded-lg flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-gaming-text font-semibold">{party.title}</h4>
                                <p className="text-gaming-text-muted text-sm">
                                  {new Date(party.eventDate).toLocaleDateString()} • {party.registrationCount}/{party.capacity} players • {party.location}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge className={getStatusColor(party.eventDate)}>
                                {getStatusText(party.eventDate)}
                              </Badge>
                              <Button variant="ghost" size="sm" className="text-gaming-text-muted hover:text-gaming-blue">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gaming-text-muted hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="text-center mt-6">
                      <Link href="/create">
                        <Button className="bg-gradient-to-r from-gaming-blue to-gaming-green">
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Party
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="registered" className="p-6">
              <div className="space-y-4">
                {registeredParties.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gaming-card rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-gaming-text-muted" />
                    </div>
                    <h3 className="text-xl font-semibold text-gaming-text mb-2">No registered events</h3>
                    <p className="text-gaming-text-muted mb-4">
                      Discover and join exciting LAN parties in your area!
                    </p>
                    <Link href="/discover">
                      <Button className="bg-gradient-to-r from-gaming-blue to-gaming-green">
                        Discover Parties
                      </Button>
                    </Link>
                  </div>
                ) : (
                  registeredParties.map((party) => (
                    <Card key={party.id} className="bg-gaming-dark border-gaming-green/20 hover:border-gaming-green/40 transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-gaming-green to-gaming-purple rounded-lg flex items-center justify-center">
                              <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-gaming-text font-semibold">{party.title}</h4>
                              <p className="text-gaming-text-muted text-sm">
                                {new Date(party.eventDate).toLocaleDateString()} • Hosted by {party.host.username} • {party.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(party.eventDate)}>
                              {getStatusText(party.eventDate)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gaming-card rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-gaming-text-muted" />
                </div>
                <h3 className="text-xl font-semibold text-gaming-text mb-2">Party History</h3>
                <p className="text-gaming-text-muted">
                  View your past gaming events and memorable moments.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
