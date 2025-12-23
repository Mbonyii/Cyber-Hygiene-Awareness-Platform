import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Shield, Award, BookOpen, Target, TrendingUp, Lock, Mail, Users, ChevronRight, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { UserProgress } from "@shared/schema";

export default function Home() {
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: userBadges = [] } = useQuery<any>({
    queryKey: ["/api/user-badges"],
  });

  const { data: recommendedModule } = useQuery<any>({
    queryKey: ["/api/recommended-module"],
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
        <div className="text-primary text-glow">Loading...</div>
      </div>
    );
  }

  const completedModulesCount = progress.filter((p: UserProgress) => p.status === 'completed').length;
  const completionPercentage = modules.length > 0 ? (completedModulesCount / modules.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary text-glow">CyberGuard Academy</h1>
            </div>
            <div className="hidden md:flex gap-4">
              <Link href="/">
                <a className="text-foreground hover:text-primary transition-colors" data-testid="link-dashboard">Dashboard</a>
              </Link>
              <Link href="/modules">
                <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-modules">Modules</a>
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
        {/* Header Stats */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.firstName || 'Trainee'}!</h2>
          <p className="text-muted-foreground">Continue your cyber security journey</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 hover:glow-effect transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Cyber Hygiene Score</div>
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="text-4xl font-bold text-primary text-glow mb-1" data-testid="text-score">
              {user.cyberHygieneScore}
            </div>
            <div className="text-xs text-muted-foreground">Points earned</div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Modules Completed</div>
              <BookOpen className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-4xl font-bold mb-1" data-testid="text-completed-modules">
              {completedModulesCount}/{modules.length}
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Quizzes Taken</div>
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="text-4xl font-bold mb-1" data-testid="text-quizzes">
              {user.totalQuizzesTaken}
            </div>
            <div className="text-xs text-muted-foreground">Total attempts</div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Badges Earned</div>
              <Award className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-4xl font-bold mb-1" data-testid="text-badges">
              {userBadges.length}
            </div>
            <div className="text-xs text-muted-foreground">Achievements</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recommended Module */}
          <div className="lg:col-span-2 space-y-6">
            {recommendedModule && (
              <Card className="p-6 bg-gradient-to-br from-primary/10 via-card/50 to-secondary/10 border-primary/30">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge className="mb-3 bg-primary/20 text-primary border-primary/30">Recommended for You</Badge>
                    <h3 className="text-2xl font-bold mb-2">{recommendedModule.title}</h3>
                    <p className="text-muted-foreground">{recommendedModule.description}</p>
                  </div>
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline">{recommendedModule.difficulty}</Badge>
                  <span className="text-sm text-muted-foreground">{recommendedModule.estimatedMinutes} min</span>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
                    {recommendedModule.category}
                  </Badge>
                </div>
                <Link href={`/modules/${recommendedModule.id}`}>
                  <Button className="w-full glow-effect" data-testid={`button-start-${recommendedModule.id}`}>
                    Start Learning <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>
            )}

            {/* Recent Modules */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                All Learning Modules
              </h3>
              <div className="space-y-3">
                {modules.slice(0, 5).map((module: any) => {
                  const moduleProgress = progress.find((p: UserProgress) => p.moduleId === module.id);
                  const isCompleted = moduleProgress?.status === 'completed';
                  
                  return (
                    <Link key={module.id} href={`/modules/${module.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer hover:bg-primary/5" data-testid={`card-module-${module.id}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{module.title}</h4>
                            {isCompleted && (
                              <Badge className="bg-primary/20 text-primary border-primary/30">
                                ✓ Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{module.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="text-xs">{module.difficulty}</Badge>
                            <span className="text-xs text-muted-foreground">{module.estimatedMinutes} min</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Link href="/modules">
                <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-modules">
                  View All Modules
                </Button>
              </Link>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badges */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Your Badges
              </h3>
              {userBadges.length === 0 ? (
                <p className="text-muted-foreground text-sm">Complete modules and quizzes to earn badges!</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {userBadges.map((ub: any) => (
                    <div key={ub.id} className="flex flex-col items-center p-3 rounded-lg bg-primary/5 border border-primary/20" data-testid={`badge-${ub.badge.id}`}>
                      <div className="text-3xl mb-1">{ub.badge.icon}</div>
                      <div className="text-xs text-center font-medium line-clamp-2">{ub.badge.name}</div>
                      <div className="text-xs text-primary">+{ub.badge.points}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/phishing-simulator">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-phishing-simulator">
                    <Mail className="w-4 h-4 mr-2" />
                    Phishing Simulator
                  </Button>
                </Link>
                <Link href="/password-tester">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-password-tester">
                    <Lock className="w-4 h-4 mr-2" />
                    Password Tester
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
