import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, UsersRound, Star, Gamepad } from "lucide-react";
import type { PartyWithHost, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function Sidebar() {
  const { user } = useAuth();

  const { data: upcomingParties = [] } = useQuery<PartyWithHost[]>({
    queryKey: ["/api/parties/upcoming"],
  });
  const { data: myParties = [], isLoading: partiesLoading } = useQuery<PartyWithHost[]>({
    queryKey: ["/api/parties/my"],
    enabled: !!user,
  });

  const { data: friends = [], isLoading: friendsLoading } = useQuery<User[]>({
    queryKey: ["/api/friends"],
  });

  return (
    <aside className="hidden lg:block w-64 bg-dark-secondary h-screen sticky top-16 border-r border-dark-tertiary">
      <div className="p-6">
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="bg-dark-tertiary border-gray-600">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm text-text-secondary mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Parties Hosted</span>
                  <span className="text-accent-purple font-semibold">{myParties.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Parties Attended</span>
                  <span className="text-accent-blue font-semibold">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Friends</span>
                  <span className="text-accent-cyan font-semibold">{friends.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-dark-tertiary border-gray-600">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm text-text-secondary mb-3">Upcoming Events</h3>
              <div className="space-y-3">
                {upcomingParties.length === 0 ? (
                  <div className="text-center py-4">
                    <Gamepad className="h-8 w-8 text-text-secondary mx-auto mb-2" />
                    <p className="text-xs text-text-secondary">No upcoming events</p>
                  </div>
                ) : (
                  upcomingParties.slice(0, 3).map((party) => (
                    <div key={party.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-accent-purple rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{party.title}</p>
                        <p className="text-xs text-text-secondary">
                          {new Date(party.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Popular Games */}
          <Card className="bg-dark-tertiary border-gray-600">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm text-text-secondary mb-3">Popular Games</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">Elder Scrolls Online</span>
                  <span className="text-xs bg-accent-purple px-2 py-1 rounded text-white">MMORPG</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">Brawlhalla</span>
                  <span className="text-xs bg-accent-blue px-2 py-1 rounded text-white">Platform</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">For Honor</span>
                  <span className="text-xs bg-accent-cyan px-2 py-1 rounded text-white">PVP</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </aside>
  );
}
