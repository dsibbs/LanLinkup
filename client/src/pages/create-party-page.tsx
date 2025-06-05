import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertPartySchema, type InsertParty } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Rocket, Save } from "lucide-react";
import Navigation from "@/components/navigation";

const games = [
  "Counter-Strike: Global Offensive",
  "League of Legends",
  "Valorant",
  "Dota 2",
  "Overwatch 2",
  "Rocket League",
  "Apex Legends",
  "Fortnite",
  "Call of Duty",
  "Other",
];

const capacityOptions = [
  "2-4 players",
  "5-8 players",
  "9-12 players",
  "13-16 players",
  "17-24 players",
  "25+ players",
];

export default function CreatePartyPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm<InsertParty>({
    resolver: zodResolver(insertPartySchema),
    defaultValues: {
      title: "",
      description: "",
      game: "",
      capacity: 8,
      location: "",
      fullAddress: "",
      visibility: "public",
      eventDate: "",
    },
  });

  const createPartyMutation = useMutation({
    mutationFn: async (data: InsertParty) => {
      const res = await apiRequest("POST", "/api/parties", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Party created!",
        description: "Your LAN party has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/parties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/parties"] });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create party",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertParty) => {
    createPartyMutation.mutate(data);
  };

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateTime = formatDateTimeLocal(tomorrow);

  return (
    <div className="min-h-screen bg-gaming-darker">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gaming-text mb-4">Host Your Own LAN Party</h1>
          <p className="text-xl text-gaming-text-muted">Create an epic gaming event for your community</p>
        </div>

        <Card className="bg-gaming-card border-gaming-green/20 shadow-gaming-card">
          <CardHeader>
            <CardTitle className="text-gaming-text">Party Details</CardTitle>
            <CardDescription className="text-gaming-text-muted">
              Fill in the details for your gaming event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gaming-text">Party Title</Label>
                  <Input
                    id="title"
                    placeholder="Epic CS:GO Tournament"
                    className="bg-gaming-dark border-gaming-green/30 text-gaming-text placeholder:text-gaming-text-muted focus:border-gaming-green"
                    {...form.register("title")}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="game" className="text-gaming-text">Game</Label>
                  <Select onValueChange={(value) => form.setValue("game", value)}>
                    <SelectTrigger className="bg-gaming-dark border-gaming-green/30 text-gaming-text focus:border-gaming-green">
                      <SelectValue placeholder="Select a game" />
                    </SelectTrigger>
                    <SelectContent className="bg-gaming-dark border-gaming-green/30">
                      {games.map((game) => (
                        <SelectItem key={game} value={game} className="text-gaming-text hover:bg-gaming-green/20">
                          {game}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.game && (
                    <p className="text-sm text-destructive">{form.formState.errors.game.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gaming-text">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe your party... What makes it special? What should players expect?"
                  className="bg-gaming-dark border-gaming-green/30 text-gaming-text placeholder:text-gaming-text-muted focus:border-gaming-green"
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="eventDate" className="text-gaming-text">Date & Time</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    min={minDateTime}
                    className="bg-gaming-dark border-gaming-green/30 text-gaming-text focus:border-gaming-green"
                    {...form.register("eventDate")}
                  />
                  {form.formState.errors.eventDate && (
                    <p className="text-sm text-destructive">{form.formState.errors.eventDate.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-gaming-text">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="2"
                    max="100"
                    placeholder="8"
                    className="bg-gaming-dark border-gaming-green/30 text-gaming-text placeholder:text-gaming-text-muted focus:border-gaming-green"
                    {...form.register("capacity", { valueAsNumber: true })}
                  />
                  {form.formState.errors.capacity && (
                    <p className="text-sm text-destructive">{form.formState.errors.capacity.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gaming-text">City/Town</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco"
                    className="bg-gaming-dark border-gaming-green/30 text-gaming-text placeholder:text-gaming-text-muted focus:border-gaming-green"
                    {...form.register("location")}
                  />
                  {form.formState.errors.location && (
                    <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="visibility" className="text-gaming-text">Visibility</Label>
                  <Select onValueChange={(value) => form.setValue("visibility", value as any)}>
                    <SelectTrigger className="bg-gaming-dark border-gaming-green/30 text-gaming-text focus:border-gaming-green">
                      <SelectValue placeholder="Public" />
                    </SelectTrigger>
                    <SelectContent className="bg-gaming-dark border-gaming-green/30">
                      <SelectItem value="public" className="text-gaming-text hover:bg-gaming-green/20">Public</SelectItem>
                      <SelectItem value="friends_only" className="text-gaming-text hover:bg-gaming-green/20">Friends Only</SelectItem>
                      <SelectItem value="private" className="text-gaming-text hover:bg-gaming-green/20">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.visibility && (
                    <p className="text-sm text-destructive">{form.formState.errors.visibility.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullAddress" className="text-gaming-text">Full Address</Label>
                <Input
                  id="fullAddress"
                  placeholder="123 Gaming Street, San Francisco, CA 94102"
                  className="bg-gaming-dark border-gaming-green/30 text-gaming-text placeholder:text-gaming-text-muted focus:border-gaming-green"
                  {...form.register("fullAddress")}
                />
                <p className="text-xs text-gaming-text-muted">Address will only be shared with confirmed attendees</p>
                {form.formState.errors.fullAddress && (
                  <p className="text-sm text-destructive">{form.formState.errors.fullAddress.message}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-gaming-green to-gaming-blue text-white font-semibold text-lg hover:shadow-gaming-green transition-all duration-200"
                  disabled={createPartyMutation.isPending}
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  {createPartyMutation.isPending ? "Creating Party..." : "Create Party"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
