import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Shield, BookOpen, ChevronRight, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { UserProgress } from "@shared/schema";

export default function Modules() {
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [user, isLoading, toast]);

  const { data: modules = [] } = useQuery<any>({
    queryKey: ["/api/modules"],
  });

  const { data: progress = [] } = useQuery<any>({
    queryKey: ["/api/progress"],
  });

  if (isLoading || !user) {
    return <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
      <div className="text-primary text-glow">Loading...</div>
    </div>;
  }

  const completedCount = progress.filter((p: UserProgress) => p.status === 'completed').length;
  const progressPercentage = modules.length > 0 ? (completedCount / modules.length) * 100 : 0;

  // Group modules by category
  const modulesByCategory = modules.reduce((acc: any, module: any) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Shield className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold text-primary text-glow">CyberGuard Academy</h1>
              </div>
            </Link>
            <div className="hidden md:flex gap-4">
              <Link href="/">
                <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-dashboard">Dashboard</a>
              </Link>
              <Link href="/modules">
                <a className="text-foreground hover:text-primary transition-colors" data-testid="link-modules">Modules</a>
              </Link>
              <Link href="/phishing-simulator">
                <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-phishing">Phishing Simulator</a>
              </Link>
              <Link href="/password-tester">
                <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-password">Password Tester</a>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold">{user.firstName?.[0] || user.email?.[0]?.toUpperCase()}</span>
              </div>
              <span className="text-muted-foreground">{user.firstName || user.email}</span>
            </div>
            <Button onClick={() => logout()} variant="outline" size="sm">Logout</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-primary" />
            Learning Modules
          </h2>
          <p className="text-muted-foreground text-lg">Master cyber security one topic at a time</p>
        </div>

        {/* Progress Overview */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-card/50 border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Your Progress</h3>
              <p className="text-muted-foreground">
                {completedCount} of {modules.length} modules completed
              </p>
            </div>
            <div className="text-4xl font-bold text-primary text-glow">{Math.round(progressPercentage)}%</div>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </Card>

        {/* Modules by Category */}
        <div className="space-y-8">
          {Object.entries(modulesByCategory).map(([category, categoryModules]: [string, any]) => (
            <div key={category}>
              <h3 className="text-2xl font-bold mb-4 text-primary">{category}</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {categoryModules.map((module: any) => {
                  const moduleProgress = progress.find((p: UserProgress) => p.moduleId === module.id);
                  const isCompleted = moduleProgress?.status === 'completed';
                  const isInProgress = moduleProgress?.status === 'in_progress';
                  
                  return (
                    <Card key={module.id} className="p-6 bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all hover:glow-effect">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-xl font-semibold">{module.title}</h4>
                            {isCompleted && (
                              <Badge className="bg-primary/20 text-primary border-primary/30">
                                ✓ Completed
                              </Badge>
                            )}
                            {isInProgress && !isCompleted && (
                              <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                                In Progress
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-4">{module.description}</p>
                          <div className="flex items-center gap-3 mb-4">
                            <Badge variant="outline">{module.difficulty}</Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {module.estimatedMinutes} min
                            </div>
                          </div>
                          {moduleProgress?.score !== null && moduleProgress?.score !== undefined && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Last Score</span>
                                <span className="font-semibold">{moduleProgress.score}%</span>
                              </div>
                              <Progress value={moduleProgress.score} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                      <Link href={`/modules/${module.id}`}>
                        <Button className="w-full" variant={isCompleted ? "outline" : "default"} data-testid={`button-module-${module.id}`}>
                          {isCompleted ? "Review Module" : "Start Module"}
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
