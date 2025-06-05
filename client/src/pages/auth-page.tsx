import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Gamepad, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
  agreeTerms: z.boolean().refine(val => val === true, "You must agree to the terms"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      bio: "",
      location: "",
      agreeTerms: false,
    },
  });

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  const onRegister = (data: RegisterFormData) => {
    const { confirmPassword, agreeTerms, ...userData } = data;
    registerMutation.mutate(userData);
  };

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary to-dark-secondary flex">
      {/* Left side - Forms */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-dark-secondary border-dark-tertiary">
          <CardContent className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Gamepad className="h-8 w-8 text-accent-purple" />
                <span className="text-2xl font-bold text-accent-purple">LAN Linkup</span>
              </div>
              <h2 className="text-xl font-semibold text-text-primary">
                {isLoginForm ? "Welcome Back!" : "Join the Community!"}
              </h2>
              <p className="text-text-secondary">
                {isLoginForm ? "Sign in to your gaming account" : "Create your gaming account"}
              </p>
            </div>

            {/* Login Form */}
            {isLoginForm ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your username"
                            className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-text-secondary" />
                              ) : (
                                <Eye className="h-4 w-4 text-text-secondary" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-gray-600 data-[state=checked]:bg-accent-purple"
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-text-secondary">
                            Remember me
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent-purple hover:bg-purple-600"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>

                  <div className="text-center">
                    <p className="text-text-secondary">
                      Don't have an account?{" "}
                      <Button
                        type="button"
                        variant="link"
                        className="text-accent-purple hover:text-purple-400 p-0"
                        onClick={() => setIsLoginForm(false)}
                      >
                        Create one
                      </Button>
                    </p>
                  </div>
                </form>
              </Form>
            ) : (
              /* Register Form */
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-6">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Choose a unique username"
                            className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email"
                            className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
                              className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-text-secondary" />
                              ) : (
                                <Eye className="h-4 w-4 text-text-secondary" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              className="bg-dark-tertiary border-gray-600 text-text-primary placeholder-text-secondary focus:border-accent-purple pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-text-secondary" />
                              ) : (
                                <Eye className="h-4 w-4 text-text-secondary" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="agreeTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-gray-600 data-[state=checked]:bg-accent-purple"
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-text-secondary">
                          I agree to the Terms of Service and Privacy Policy
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-accent-purple hover:bg-purple-600"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>

                  <div className="text-center">
                    <p className="text-text-secondary">
                      Already have an account?{" "}
                      <Button
                        type="button"
                        variant="link"
                        className="text-accent-purple hover:text-purple-400 p-0"
                        onClick={() => setIsLoginForm(true)}
                      >
                        Sign in
                      </Button>
                    </p>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 items-center justify-center p-12">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <Gamepad className="h-24 w-24 text-accent-purple mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              Connect. Game. Dominate.
            </h1>
            <p className="text-text-secondary text-lg">
              Join the ultimate LAN gaming community. Discover epic parties, make new friends, 
              and experience gaming like never before.
            </p>
          </div>
          
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-purple rounded-full flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <span className="text-text-primary">Create or discover amazing LAN parties</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <span className="text-text-primary">Connect with fellow gamers in your area</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-cyan rounded-full flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <span className="text-text-primary">Experience epic gaming sessions together</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
