import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PartyCard from "@/components/party-card";
import { Rocket, PlusCircle, Search, UsersRound, Trophy, Users, Star } from "lucide-react";
import type { PartyWithHost } from "@shared/schema";

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();

  const { data: myParties = [], isLoading: partiesLoading } = useQuery<PartyWithHost[]>({
    queryKey: ["/api/parties/my"],
    enabled: !!user,
  });

  const { data: upcomingParties = [], isLoading: upcomingLoading } = useQuery<PartyWithHost[]>({
    queryKey: ["/api/parties/upcoming"],
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-dark-secondary to-dark-tertiary border-dark-tertiary">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, <span className="text-accent-purple">{user.username}</span>!
              </h1>
              <p className="text-text-secondary">Ready to organize your next epic LAN party?</p>
            </div>
            <div className="hidden md:block">
              <Rocket className="h-16 w-16 text-accent-purple opacity-20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="bg-dark-secondary border-dark-tertiary hover:bg-dark-tertiary transition-colors cursor-pointer"
          onClick={() => onNavigate("create-party")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <PlusCircle className="h-8 w-8 text-accent-purple" />
              <div className="w-6 h-6 bg-accent-purple/20 rounded-full flex items-center justify-center">
                <span className="text-accent-purple text-sm">→</span>
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Create Party</h3>
            <p className="text-text-secondary text-sm">
              Host a new LAN party and invite your gaming community
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-dark-secondary border-dark-tertiary hover:bg-dark-tertiary transition-colors cursor-pointer"
          onClick={() => onNavigate("discover")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Search className="h-8 w-8 text-accent-blue" />
              <div className="w-6 h-6 bg-accent-blue/20 rounded-full flex items-center justify-center">
                <span className="text-accent-blue text-sm">→</span>
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Discover Parties</h3>
            <p className="text-text-secondary text-sm">
              Find amazing LAN parties happening near you
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-dark-secondary border-dark-tertiary hover:bg-dark-tertiary transition-colors cursor-pointer"
          onClick={() => onNavigate("friends")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <UsersRound className="h-8 w-8 text-accent-cyan" />
              <div className="w-6 h-6 bg-accent-cyan/20 rounded-full flex items-center justify-center">
                <span className="text-accent-cyan text-sm">→</span>
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Manage Friends</h3>
            <p className="text-text-secondary text-sm">
              Connect with fellow gamers and build your network
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-dark-secondary border-dark-tertiary text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-accent-purple rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-accent-purple">{myParties.length}</h3>
            <p className="text-text-secondary text-sm">Parties Hosted</p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-secondary border-dark-tertiary text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-accent-blue rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-accent-blue">{upcomingParties.length}</h3>
            <p className="text-text-secondary text-sm">Upcoming Events</p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-secondary border-dark-tertiary text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-accent-cyan rounded-full flex items-center justify-center mx-auto mb-3">
              <UsersRound className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-accent-cyan">-</h3>
            <p className="text-text-secondary text-sm">Friends</p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-secondary border-dark-tertiary text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-400">5.0</h3>
            <p className="text-text-secondary text-sm">Host Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* My Parties Section */}
      <Card className="bg-dark-secondary border-dark-tertiary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Parties</h2>
            <div className="flex space-x-2">
              <Button 
                onClick={() => onNavigate("create-party")}
                className="bg-accent-purple hover:bg-purple-600"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>
          </div>

          {partiesLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-dark-tertiary rounded-lg p-5 animate-pulse">
                  <div className="h-20 bg-gray-600 rounded mb-4"></div>
                  <div className="h-4 bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : myParties.length === 0 ? (
            <div className="text-center py-12">
              <PlusCircle className="h-16 w-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No parties yet</h3>
              <p className="text-text-secondary mb-4">Create your first LAN party to get started!</p>
              <Button onClick={() => onNavigate("create-party")} className="bg-accent-purple hover:bg-purple-600">
                Create Your First Party
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myParties.map((party) => (
                <PartyCard 
                  key={party.id} 
                  party={party} 
                  showEditActions={true}
                  onJoin={() => {}}
                  onEdit={() => {}}
                  onCancel={() => {}}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Parties */}
      {upcomingParties.length > 0 && (
        <Card className="bg-dark-secondary border-dark-tertiary">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingParties.map((party) => (
                <PartyCard 
                  key={party.id} 
                  party={party} 
                  showEditActions={false}
                  onJoin={() => {}}
                  onEdit={() => {}}
                  onCancel={() => {}}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
