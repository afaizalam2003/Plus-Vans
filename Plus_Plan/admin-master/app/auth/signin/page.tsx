"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { loginUser } from "@/redux/slices/userSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Logo } from "@/components/logo";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PATHS } from "@/lib/paths";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { loading, userId } = useAppSelector((state) => ({
    loading: state.user.loading === "pending",
    userId: state.user.id,
  }));

  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;

    try {
      const resultAction = await dispatch(loginUser({ username: email, password }));
      
      if (loginUser.fulfilled.match(resultAction)) {
        toast.success("Successfully signed in");
        
        // Get the callback URL from the query parameters or default to admin
        const callbackUrl = searchParams.get('callbackUrl') || PATHS.ADMIN;
        
        // Small delay to ensure cookies are set before redirect
        // Using window.location.href to ensure full page reload and middleware check
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 100);
      } else {
        toast.error("Failed to sign in. Please check your credentials.");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      const errorMessage =
        typeof error === "object" && error !== null
          ? (error as { message?: string })?.message || "Failed to sign in"
          : "Failed to sign in";
      toast.error(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full p-8 shadow-lg border-t-4 border-t-primary">
      <div className="flex flex-col items-center mb-8">
        <Logo width={150} height={50} className="mb-4" />
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email address
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-3 focus:ring-2 focus:ring-primary/20 transition-all"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-10 focus:ring-2 focus:ring-primary/20 transition-all"
              autoComplete="current-password"
              placeholder="********"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>
        </div>

        <Button
          className="w-full transition-all hover:shadow-md"
          type="submit"
          disabled={loading}
          size="lg"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Card>
  );
}
