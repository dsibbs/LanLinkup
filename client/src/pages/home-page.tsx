import { useState } from "react";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import Dashboard from "./dashboard";
import Discover from "./discover";
import CreateParty from "./create-party";
import Friends from "./friends";
import Profile from "./profile";

type ViewType = "dashboard" | "discover" | "create-party" | "friends" | "profile";

export default function HomePage() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentView} />;
      case "discover":
        return <Discover onNavigate={setCurrentView} />;
      case "create-party":
        return <CreateParty onNavigate={setCurrentView} />;
      case "friends":
        return <Friends onNavigate={setCurrentView} />;
      case "profile":
        return <Profile onNavigate={setCurrentView} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary text-text-primary">
      <Navigation currentView={currentView} onNavigate={setCurrentView} />
      
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 pb-20 md:pb-6">
          {renderCurrentView()}
        </main>
      </div>

      <MobileNav currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
}
