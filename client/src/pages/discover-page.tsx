import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import Navigation from "@/components/navigation";
import PartyCard from "@/components/party-card";

export default function DiscoverPage() {
  const [searchGame, setSearchGame] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { data: parties = [], isLoading } = useQuery({
    queryKey: ["/api/parties", { game: searchGame, location: searchLocation }],
  });

  const filters = [
    { id: "all", label: "All Games" },
    { id: "fps", label: "FPS" },
    { id: "moba", label: "MOBA" },
    { id: "strategy", label: "Strategy" },
    { id: "weekend", label: "This Weekend" },
  ];

  const handleSearch = () => {
    // Query will automatically refetch when searchGame or searchLocation changes
  };

  return (
    <div className="min-h-screen bg-gaming-darker">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gaming-text mb-4">Discover Epic LAN Parties</h1>
          <p className="text-xl text-gaming-text-muted">Find gaming events near you and join the action</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-gaming-card rounded-2xl p-6 mb-8 border border-gaming-blue/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Search by game title..."
                value={searchGame}
                onChange={(e) => setSearchGame(e.target.value)}
                className="bg-gaming-dark border-gaming-blue/30 text-gaming-text placeholder:text-gaming-text-muted focus:border-gaming-blue"
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="bg-gaming-dark border-gaming-blue/30 text-gaming-text placeholder:text-gaming-text-muted focus:border-gaming-blue"
              />
            </div>
            <div>
              <Button 
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-gaming-blue to-gaming-green hover:shadow-gaming"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4">
            {filters.map((filter) => (
              <Badge
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedFilter === filter.id
                    ? "bg-gaming-blue text-white"
                    : "bg-gaming-card text-gaming-text-muted border-gaming-card hover:bg-gaming-blue/20 hover:text-gaming-blue hover:border-gaming-blue/30"
                }`}
                onClick={() => setSelectedFilter(filter.id)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Party Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gaming-card rounded-2xl p-6 animate-pulse">
                <div className="h-48 bg-gaming-dark rounded-lg mb-4"></div>
                <div className="h-4 bg-gaming-dark rounded mb-2"></div>
                <div className="h-4 bg-gaming-dark rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : parties.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gaming-card rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gaming-text-muted" />
            </div>
            <h3 className="text-xl font-semibold text-gaming-text mb-2">No parties found</h3>
            <p className="text-gaming-text-muted">
              Try adjusting your search criteria or check back later for new events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parties.map((party) => (
              <PartyCard key={party.id} party={party} />
            ))}
          </div>
        )}

        {parties.length > 0 && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="border-gaming-blue text-gaming-blue hover:bg-gaming-blue hover:text-white"
            >
              Load More Parties
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
