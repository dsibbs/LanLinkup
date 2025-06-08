import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, Edit, Trophy, Users, Star, Calendar, MapPin, Gamepad } from "lucide-react";
import type { UserWithStats, PartyWithHost } from "@shared/schema";

const updateProfileSchema = z.object({
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

interface ProfileProps {
  onNavigate: (view: string) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: userStats } = useQuery<UserWithStats>({
    queryKey: ["/api/users", user?.id],
    enabled: !!user,
  });

  const { data: myParties = [] } = useQuery<PartyWithHost[]>({
    queryKey: ["/api/parties/my"],
    enabled: !!user,
  });

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      bio: userStats?.bio || "",
      location: userStats?.location || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileFormData) => {
      await apiRequest("PUT", `/api/users/${user!.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your profile has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="text-center text-red-500 mt-10">
        Error: User is not logged in or user context is unavailable.
      </div>
    );
  }
  
  if (!userStats) {
    return (
      <div className="text-center text-red-500 mt-10">
        Error: Unable to load user profile data. Please try again later.
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="bg-dark-secondary border-dark-tertiary">
        <CardContent className="p-8">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-purple to-accent-blue rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-dark-secondary"></div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold">{userStats.username}</h1>
                <span className="px-3 py-1 bg-green-600 text-green-100 rounded-full text-sm font-medium">
                  Online
                </span>
              </div>
              <p className="text-text-secondary mb-4">{userStats.email}</p>
              
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-secondary">Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder="Tell other gamers about yourself..."
                              className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-secondary">Location</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Your city or region..."
                              className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-accent-purple hover:bg-purple-600"
                        size="sm"
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="bg-dark-tertiary border-gray-600 hover:bg-gray-600"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <>
                  <p className="text-text-primary mb-4">
                    {userStats.bio || "This gamer hasn't written a bio yet."}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-text-secondary mb-4">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Member since {new Date(userStats.createdAt).toLocaleDateString()}
                    </span>
                    {userStats.location && (
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {userStats.location}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {!isEditing && (
              <Button
                onClick={() => {
                  form.reset({
                    bio: userStats.bio || "",
                    location: userStats.location || "",
                  });
                  setIsEditing(true);
                }}
                className="bg-accent-blue hover:bg-blue-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-dark-secondary border-dark-tertiary text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-accent-purple rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-accent-purple">{userStats.stats.partiesHosted}</h3>
            <p className="text-text-secondary text-sm">Parties Hosted</p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-secondary border-dark-tertiary text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-accent-blue rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-accent-blue">{userStats.stats.partiesAttended}</h3>
            <p className="text-text-secondary text-sm">Parties Attended</p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-secondary border-dark-tertiary text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-accent-cyan rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-accent-cyan">{userStats.stats.friends}</h3>
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

      {/* Party History */}
      <Card className="bg-dark-secondary border-dark-tertiary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Party History</h2>
            <div className="flex space-x-2">
              <Button className="bg-accent-purple text-white" size="sm">
                Hosted
              </Button>
              <Button variant="outline" className="bg-dark-tertiary border-gray-600 hover:bg-gray-600" size="sm">
                Attended
              </Button>
            </div>
          </div>

          {myParties.length === 0 ? (
            <div className="text-center py-12">
              <Gamepad className="h-16 w-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No parties yet</h3>
              <p className="text-text-secondary mb-4">Host your first LAN party to start building your gaming legacy!</p>
              <Button onClick={() => onNavigate("create-party")} className="bg-accent-purple hover:bg-purple-600">
                Create Your First Party
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myParties.map((party) => (
                <div key={party.id} className="bg-dark-tertiary rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-accent-purple rounded-lg flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{party.title}</h3>
                      <p className="text-text-secondary text-sm">
                        {new Date(party.date).toLocaleDateString()} • {party.attendeeCount}/{party.capacity} players
                      </p>
                      <p className="text-accent-purple text-sm font-medium">Hosted</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-green-600 text-green-100 rounded-full text-xs">
                      {new Date(party.date) > new Date() ? "Upcoming" : "Completed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
