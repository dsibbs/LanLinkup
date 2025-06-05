import { Button } from "@/components/ui/button";
import { Home, Search, Plus, Users, User } from "lucide-react";

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function MobileNav({ currentView, onNavigate }: MobileNavProps) {
  const navItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "discover", label: "Discover", icon: Search },
    { id: "create-party", label: "Create", icon: Plus },
    { id: "friends", label: "Friends", icon: Users },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-secondary border-t border-dark-tertiary z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentView === item.id;
          const isCreateButton = item.id === "create-party";
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center p-2 h-auto min-w-0 ${
                isCreateButton
                  ? "bg-accent-purple text-white hover:bg-purple-600 rounded-lg"
                  : isActive
                  ? "text-accent-purple"
                  : "text-text-secondary hover:text-accent-purple"
              }`}
            >
              <IconComponent className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
