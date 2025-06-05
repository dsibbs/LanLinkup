import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Users, Calendar, MapPin } from "lucide-react";
import { useLocation } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      bio: "",
      favoriteGames: [],
      location: "",
    },
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: InsertUser) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gaming-darker flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Gamepad2 className="h-8 w-8 text-gaming-blue" />
              <span className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-gaming-blue to-gaming-green bg-clip-text text-transparent">
                  LAN Linkup
                </span>
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gaming-text mb-2">
              Join the Gaming Community
            </h1>
            <p className="text-gaming-text-muted">
              Connect with gamers and organize epic LAN parties
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gaming-card">
              <TabsTrigger value="login" className="data-[state=active]:bg-gaming-blue data-[state=active]:text-white">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-gaming-green data-[state=active]:text-white">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-gaming-card border-gaming-blue/20">
                <CardHeader>
                  <CardTitle className="text-gaming-text">Welcome Back</CardTitle>
                  <CardDescription className="text-gaming-text-muted">
                    Sign in to your gaming account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-gaming-text">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="gamer@example.com"
                        className="bg-gaming-dark border-gaming-blue/30 text-gaming-text placeholder:text-gaming-text-muted focus:border-gaming-blue"
                        {...loginForm.register("email")}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gaming-text">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="bg-gaming-dark border-gaming-blue/30 text-gaming-text placeholder:text-gaming-text-muted focus:border-gaming-blue"
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full gradient-gaming-primary hover:shadow-gaming"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="bg-gaming-card border-gaming-green/20">
                <CardHeader>
                  <CardTitle className="text-gaming-text">Join the Party</CardTitle>
                  <CardDescription className="text-gaming-text-muted">
                    Create your gaming account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username" className="text-gaming-text">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="ProGamer2024"
                        className="bg-gaming-dark border-gaming-green/30 text-gaming-text placeholder:text-gaming-text-muted focus:border-gaming-green"
                        {...registerForm.register("username")}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-gaming-text">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="gamer@example.com"
                        className="bg-gaming-dark border-gaming-green/30 text-gaming-text placeholder:text-gaming-text-muted focus:border-gaming-green"
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-gaming-text">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className="bg-gaming-dark border-gaming-green/30 text-gaming-text placeholder:text-gaming-text-muted focus:border-gaming-green"
                        {...registerForm.register("password")}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-gaming-green to-gaming-blue hover:shadow-gaming-green"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gaming-dark via-gaming-card to-gaming-darker">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M10 10h80v80H10z' fill='none' stroke='%233B82F6' stroke-width='0.5' opacity='0.3'/%3E%3Ccircle cx='20' cy='20' r='2' fill='%2310B981' opacity='0.5'/%3E%3Ccircle cx='80' cy='80' r='2' fill='%238B5CF6' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px'
          }} />
        </div>
        
        <div className="relative flex flex-col justify-center h-full p-12">
          <h2 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gaming-blue via-gaming-green to-gaming-purple bg-clip-text text-transparent">
              Connect. Game. Party.
            </span>
          </h2>
          <p className="text-xl text-gaming-text-muted mb-8 max-w-lg">
            Join the ultimate LAN party platform. Discover local gaming events, 
            connect with fellow gamers, and create unforgettable gaming experiences.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gaming-blue to-gaming-green rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gaming-text">Connect with Gamers</h3>
                <p className="text-gaming-text-muted">Find like-minded players in your area</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gaming-green to-gaming-purple rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gaming-text">Organize Events</h3>
                <p className="text-gaming-text-muted">Host epic LAN parties and tournaments</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gaming-purple to-gaming-blue rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gaming-text">Discover Local Gaming</h3>
                <p className="text-gaming-text-muted">Find parties and events near you</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
