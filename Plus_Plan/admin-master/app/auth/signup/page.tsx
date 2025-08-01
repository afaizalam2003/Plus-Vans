"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { signupUser } from "@/redux/slices/userSlice";
import { useAppDispatch } from "@/redux/hooks";
import { Logo } from "@/components/logo";
import { Eye, EyeOff, Lock, Mail, User, Phone } from "lucide-react";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await dispatch(
        signupUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: "customer", // Default role for new signups
        })
      ).unwrap();

      toast.success("Account created successfully!");
      
      // Redirect to the callback URL or home page
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      window.location.href = callbackUrl;
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md p-8 shadow-lg border-t-4 border-t-primary">
      <div className="flex flex-col items-center mb-8">
        <Logo width={150} height={50} className="mb-4" />
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-muted-foreground mt-2">Fill in your details to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Full Name
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
            className="pl-3 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="pl-3 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={handleChange}
            required
            className="pl-3 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="pl-3 pr-10 focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/auth/signin${searchParams ? `?${searchParams.toString()}` : ''}`}
            className="text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </form>
    </Card>
  );
}
