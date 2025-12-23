import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export default function Landing() {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const { register: registerLogin, handleSubmit: handleSubmitLogin } = useForm<LoginForm>();
  const { register: registerRegister, handleSubmit: handleSubmitRegister } = useForm<RegisterForm>();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Login failed");
      return response.json();
    },
    onSuccess: () => {
      login();
      toast({ title: "Logged in successfully" });
    },
    onError: () => {
      toast({ title: "Login failed", variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Registration failed");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Registered successfully. Please login." });
      setActiveTab("login");
    },
    onError: () => {
      toast({ title: "Registration failed", variant: "destructive" });
    },
  });

  const onLogin = (data: LoginForm) => loginMutation.mutate(data);
  const onRegister = (data: RegisterForm) => registerMutation.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">CyberGuard Academy</h1>
          <p className="text-muted-foreground">Login or register to start learning</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" {...registerLogin("email", { required: true })} />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" {...registerLogin("password", { required: true })} />
              </div>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleSubmitRegister(onRegister)} className="space-y-4">
              <div>
                <Label htmlFor="register-firstName">First Name</Label>
                <Input id="register-firstName" {...registerRegister("firstName", { required: true })} />
              </div>
              <div>
                <Label htmlFor="register-lastName">Last Name</Label>
                <Input id="register-lastName" {...registerRegister("lastName", { required: true })} />
              </div>
              <div>
                <Label htmlFor="register-email">Email</Label>
                <Input id="register-email" type="email" {...registerRegister("email", { required: true })} />
              </div>
              <div>
                <Label htmlFor="register-password">Password</Label>
                <Input id="register-password" type="password" {...registerRegister("password", { required: true })} />
              </div>
              <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Registering..." : "Register"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
