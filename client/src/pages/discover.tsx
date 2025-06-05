import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PartyCard from "@/components/party-card";
import { Search, Filter, Map, SortAsc } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PartyWithHost } from "@shared/schema";

interface DiscoverProps {
  onNavigate: (view: string) => void;
}

export default function Discover({ onNavigate }: DiscoverProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [gameFilter, setGameFilter] = useState("");
  const { toast } = useToast();

  const { data: parties = [], isLoading } = useQuery<PartyWithHost[]>({
    queryKey: ["/api/parties", { search: searchQuery, game: gameFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (gameFilter && gameFilter !== "all") params.append("game", gameFilter);
      
      const response = await fetch(`/api/parties?${params}`);
      if (!response.ok) throw new Error("Failed to fetch parties");
      return response.json();
    },
  });

  const joinPartyMutation = useMutation({
    mutationFn: async (partyId: number) => {
      await apiRequest("POST", `/api/parties/${partyId}/join`);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've successfully joined the party!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/parties"] });
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
    queryClient.invalidateQueries({ queryKey: ["/api/parties"] });
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <Card className="bg-dark-secondary border-dark-tertiary">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Discover LAN Parties</h1>
          
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Search by Game or Location
              </label>
              <div className="relative">
                <Input
                  placeholder="Enter game title or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple pl-12"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Game Type
              </label>
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="bg-dark-tertiary border-gray-600 text-text-primary focus:border-accent-purple">
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent className="bg-dark-tertiary border-gray-600">
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="Counter-Strike 2">Counter-Strike 2</SelectItem>
                  <SelectItem value="Valorant">Valorant</SelectItem>
                  <SelectItem value="League of Legends">League of Legends</SelectItem>
                  <SelectItem value="Dota 2">Dota 2</SelectItem>
                  <SelectItem value="Overwatch 2">Overwatch 2</SelectItem>
                  <SelectItem value="Apex Legends">Apex Legends</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full bg-accent-purple hover:bg-purple-600">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <p className="text-text-secondary">
              Found <span className="text-accent-purple font-semibold">{parties.length}</span> parties
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" className="bg-dark-tertiary border-gray-600 hover:bg-gray-600">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort by Date
              </Button>
              <Button variant="outline" className="bg-dark-tertiary border-gray-600 hover:bg-gray-600">
                <Map className="h-4 w-4 mr-2" />
                Map View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Party Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-dark-secondary rounded-xl p-6 animate-pulse border border-dark-tertiary">
              <div className="h-20 bg-gray-600 rounded mb-4"></div>
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
              <div className="h-10 bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      ) : parties.length === 0 ? (
        <Card className="bg-dark-secondary border-dark-tertiary">
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No parties found</h3>
            <p className="text-text-secondary mb-4">
              {searchQuery || gameFilter 
                ? "Try adjusting your search criteria or create your own party!"
                : "Be the first to create a party in your area!"
              }
            </p>
            <Button onClick={() => onNavigate("create-party")} className="bg-accent-purple hover:bg-purple-600">
              Create Party
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {parties.map((party) => (
            <PartyCard
              key={party.id}
              party={party}
              showEditActions={false}
              onJoin={() => joinPartyMutation.mutate(party.id)}
              onEdit={() => {}}
              onCancel={() => {}}
              isJoining={joinPartyMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
