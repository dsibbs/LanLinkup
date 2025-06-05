import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Gamepad, Home, Search, Users, User, Plus, Bell, LogOut } from "lucide-react";

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Navigation({ currentView, onNavigate }: NavigationProps) {
  const { user, logoutMutation } = useAuth();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "discover", label: "Discover", icon: Search },
    { id: "friends", label: "Friends", icon: Users },
    { id: "profile", label: "Profile", icon: User },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-dark-secondary border-b border-dark-tertiary sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Gamepad className="h-8 w-8 text-accent-purple" />
              <span className="text-xl font-bold text-accent-purple">LAN Linkup</span>
            </div>
          </div>
          
          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => onNavigate(item.id)}
                  className={`text-text-secondary hover:text-accent-purple transition-colors ${
                    currentView === item.id ? "text-accent-purple" : ""
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative text-text-secondary hover:text-accent-purple">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-accent-purple text-xs rounded-full h-5 w-5 flex items-center justify-center text-white">
                3
              </span>
            </Button>

            {/* Create Party Button */}
            <Button
              onClick={() => onNavigate("create-party")}
              className="bg-accent-purple hover:bg-purple-600"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Party
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary hidden sm:block">
                {user?.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-text-secondary hover:text-text-primary"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
