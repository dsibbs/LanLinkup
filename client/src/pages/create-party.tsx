import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AddressAutocomplete } from "@/components/AddressAutoComplete";
import { insertPartySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Rocket, Save, X } from "lucide-react";
import { z } from "zod";

const createPartySchema = insertPartySchema.extend({
  date: z.string().min(1, "Date is required"),
});

type CreatePartyFormData = z.infer<typeof createPartySchema>;

interface CreatePartyProps {
  onNavigate: (view: string) => void;
}

export default function CreateParty({ onNavigate }: CreatePartyProps) {
  const { toast } = useToast();

  const form = useForm<CreatePartyFormData>({
    resolver: zodResolver(createPartySchema),
    defaultValues: {
      title: "",
      description: "",
      game: "",
      capacity: 16,
      location: "",
      address: "",
      visibility: "public",
      date: "",
    },
  });

  const createPartyMutation = useMutation({
    mutationFn: async (data: CreatePartyFormData) => {
      const partyData = {
        ...data,
        date: new Date(data.date),
      };
      await apiRequest("POST", "/api/parties", partyData);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your LAN party has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/parties"] });
      onNavigate("dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreatePartyFormData) => {
    createPartyMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      <Card className="bg-dark-secondary border-dark-tertiary">
        <CardContent className="p-8">
          <div className="flex items-center space-x-3 mb-8">
            <PlusCircle className="h-8 w-8 text-accent-purple" />
            <h1 className="text-3xl font-bold">Create New LAN Party</h1>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-accent-purple border-b border-dark-tertiary pb-2">
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Party Title *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter an exciting title for your party..."
                            className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="game"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Game *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter the game name"
                            className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-secondary">Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder="Describe your party, what to expect, skill level, prizes, etc..."
                          className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Event Details */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-accent-blue border-b border-dark-tertiary pb-2">
                  Event Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Date & Time *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="datetime-local"
                            className="bg-dark-tertiary border-gray-600 text-text-primary focus:border-accent-purple"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Capacity *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="2"
                            max="100"
                            placeholder="16"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-accent-cyan border-b border-dark-tertiary pb-2">
                  Location
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">City/Town *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="San Francisco"
                            className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Visibility *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-dark-tertiary border-gray-600 text-text-primary focus:border-accent-purple">
                              <SelectValue placeholder="Choose visibility..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark-tertiary border-gray-600">
                            <SelectItem value="public">Public - Anyone can find and join</SelectItem>
                            <SelectItem value="friends">Friends Only - Only your friends can see</SelectItem>
                            <SelectItem value="private">Private - Invite only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-secondary">Full Address *</FormLabel>
                      <FormControl>
                        <AddressAutocomplete value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <p className="text-text-secondary text-xs mt-1">
                        This will only be shared with confirmed attendees
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 pt-6 border-t border-dark-tertiary">
                <Button
                  type="submit"
                  disabled={createPartyMutation.isPending}
                  className="bg-accent-purple hover:bg-purple-600 px-8 py-3"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  {createPartyMutation.isPending ? "Creating..." : "Create Party"}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="text-text-secondary hover:text-text-primary"
                  onClick={() => onNavigate("dashboard")}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
