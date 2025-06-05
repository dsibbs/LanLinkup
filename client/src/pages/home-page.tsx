import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Users, Calendar, Search, Plus, Trophy } from "lucide-react";
import Navigation from "@/components/navigation";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gaming-darker">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gaming-darker via-gaming-dark to-gaming-card"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M10 10h80v80H10z' fill='none' stroke='%233B82F6' stroke-width='0.5' opacity='0.3'/%3E%3Ccircle cx='20' cy='20' r='2' fill='%2310B981' opacity='0.5'/%3E%3Ccircle cx='80' cy='80' r='2' fill='%238B5CF6' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px'
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gaming-blue via-gaming-green to-gaming-purple bg-clip-text text-transparent">
              Connect. Game. Party.
            </span>
          </h1>
          <p className="text-xl text-gaming-text-muted mb-8 max-w-3xl mx-auto">
            Join the ultimate LAN party platform. Discover local gaming events, connect with fellow gamers, 
            and create unforgettable gaming experiences in your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/discover">
              <Button className="px-8 py-4 bg-gradient-to-r from-gaming-blue to-gaming-green rounded-xl text-white font-semibold text-lg hover:shadow-gaming transform hover:scale-105 transition-all duration-200">
                <Search className="mr-2 h-5 w-5" />
                Discover Parties
              </Button>
            </Link>
            <Link href="/create">
              <Button variant="outline" className="px-8 py-4 border-2 border-gaming-blue text-gaming-blue rounded-xl font-semibold text-lg hover:bg-gaming-blue hover:text-white transition-all duration-200">
                <Plus className="mr-2 h-5 w-5" />
                Host a Party
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gaming-dark/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gaming-text mb-4">Why Choose LAN Linkup?</h2>
            <p className="text-xl text-gaming-text-muted">Everything you need for epic gaming experiences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gaming-card border-gaming-blue/20 hover:border-gaming-blue/40 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gaming-blue to-gaming-green rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gaming-text">Connect with Gamers</CardTitle>
                <CardDescription className="text-gaming-text-muted">
                  Find like-minded players in your area and build lasting gaming friendships
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gaming-card border-gaming-green/20 hover:border-gaming-green/40 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gaming-green to-gaming-purple rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gaming-text">Organize Events</CardTitle>
                <CardDescription className="text-gaming-text-muted">
                  Host epic LAN parties and tournaments with comprehensive event management tools
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gaming-card border-gaming-purple/20 hover:border-gaming-purple/40 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gaming-purple to-gaming-blue rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gaming-text">Compete & Win</CardTitle>
                <CardDescription className="text-gaming-text-muted">
                  Join tournaments, climb leaderboards, and showcase your gaming skills
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gaming-darker">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gaming-text mb-4">Ready to Level Up Your Gaming?</h2>
          <p className="text-xl text-gaming-text-muted mb-8">
            Join thousands of gamers already using LAN Linkup to organize and discover amazing gaming events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/discover">
              <Button className="px-8 py-4 bg-gradient-to-r from-gaming-blue to-gaming-green rounded-xl text-white font-semibold text-lg hover:shadow-gaming-green transition-all duration-200">
                Start Gaming Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gaming-darker border-t border-gaming-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Gamepad2 className="text-gaming-blue text-2xl" />
                <span className="text-xl font-bold bg-gradient-to-r from-gaming-blue to-gaming-green bg-clip-text text-transparent">
                  LAN Linkup
                </span>
              </div>
              <p className="text-gaming-text-muted mb-4">
                The ultimate platform for organizing and discovering LAN parties. 
                Connect with gamers, create epic events, and level up your gaming experience.
              </p>
            </div>
            <div>
              <h3 className="text-gaming-text font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gaming-text-muted">
                <li><Link href="/discover" className="hover:text-gaming-blue transition-colors duration-200">Discover Parties</Link></li>
                <li><Link href="/create" className="hover:text-gaming-blue transition-colors duration-200">Host Events</Link></li>
                <li><Link href="/friends" className="hover:text-gaming-blue transition-colors duration-200">Find Friends</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-gaming-text font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gaming-text-muted">
                <li><a href="#" className="hover:text-gaming-blue transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-gaming-blue transition-colors duration-200">Safety Guidelines</a></li>
                <li><a href="#" className="hover:text-gaming-blue transition-colors duration-200">Community Rules</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gaming-card mt-8 pt-8 text-center text-gaming-text-muted">
            <p>&copy; 2024 LAN Linkup. All rights reserved. Game on!</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
