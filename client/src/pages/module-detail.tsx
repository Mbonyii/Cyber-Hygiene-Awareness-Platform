import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { Shield, BookOpen, ChevronLeft, Award, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function ModuleDetail() {
  const [, params] = useRoute("/modules/:id");
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [user, authLoading, toast]);

  const { data: module, isLoading: moduleLoading } = useQuery<any>({
    queryKey: [`/api/modules/${params?.id}`],
    enabled: !!params?.id,
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery<any>({
    queryKey: [`/api/modules/${params?.id}/questions`],
    enabled: !!params?.id && showQuiz,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "Failed to update progress",
          variant: "destructive",
        });
      }
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/quiz-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-badges"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    },
  });

  const handleStartQuiz = () => {
    setShowQuiz(true);
    updateProgressMutation.mutate({
      moduleId: params?.id,
      status: "in_progress",
    });
  };

  const handleSubmitQuiz = () => {
    const correctCount = questions.filter((q: any) => answers[q.id] === q.correctAnswer).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const isPassing = score >= 70;

    const results = {
      score: correctCount,
      total: questions.length,
      percentage: score,
      isPassing,
      answers: questions.map((q: any) => ({
        questionId: q.id,
        userAnswer: answers[q.id] ?? -1,
        correctAnswer: q.correctAnswer,
        isCorrect: answers[q.id] === q.correctAnswer,
        explanation: q.explanation,
        question: q.question,
        options: q.options,
      })),
    };

    setQuizResults(results);
    setQuizSubmitted(true);

    submitQuizMutation.mutate({
      moduleId: params?.id,
      score: correctCount,
      totalQuestions: questions.length,
      answers: results.answers,
      weakAreas: [],
    });

    updateProgressMutation.mutate({
      moduleId: params?.id,
      status: isPassing ? "completed" : "in_progress",
      score,
    });
  };

  const handleRetryQuiz = () => {
    setAnswers({});
    setQuizSubmitted(false);
    setQuizResults(null);
  };

  if (authLoading || moduleLoading) {
    return <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
      <div className="text-primary text-glow">Loading...</div>
    </div>;
  }

  if (!module) {
    return <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
      <div className="text-muted-foreground">Module not found</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/modules">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Modules
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Button onClick={() => logout()} variant="outline" size="sm">Logout</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!showQuiz ? (
          /* Module Content */
          <div>
            <div className="mb-6">
              <Badge className="mb-3 bg-secondary/20 text-secondary border-secondary/30">{module.category}</Badge>
              <h1 className="text-4xl font-bold mb-4">{module.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{module.description}</p>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{module.difficulty}</Badge>
                <span className="text-muted-foreground">{module.estimatedMinutes} min</span>
              </div>
            </div>

            <Card className="p-8 mb-6 bg-card/50 backdrop-blur">
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: module.content.replace(/\n/g, '<br>').replace(/^# (.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3 text-primary">$1</h2>').replace(/^## (.+)$/gm, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>').replace(/^\*\*(.+?)\*\*/gm, '<strong>$1</strong>').replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
                }}
              />
            </Card>

            <Button onClick={handleStartQuiz} size="lg" className="w-full glow-effect" data-testid="button-start-quiz">
              Start Quiz <Award className="w-5 h-5 ml-2" />
            </Button>
          </div>
        ) : quizSubmitted && quizResults ? (
          /* Quiz Results */
          <div>
            <Card className={`p-8 mb-6 ${quizResults.isPassing ? 'bg-gradient-to-br from-primary/20 to-card/50 border-primary/30' : 'bg-card/50'}`}>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold mb-2 text-primary text-glow">{quizResults.percentage}%</div>
                <h2 className="text-2xl font-bold mb-2">
                  {quizResults.isPassing ? '🎉 Congratulations!' : 'Keep Practicing!'}
                </h2>
                <p className="text-muted-foreground">
                  You scored {quizResults.score} out of {quizResults.total} questions correctly
                </p>
                {quizResults.isPassing && (
                  <Badge className="mt-4 bg-primary/20 text-primary border-primary/30">
                    ✓ Module Completed
                  </Badge>
                )}
              </div>
            </Card>

            <div className="space-y-4 mb-6">
              {quizResults.answers.map((result: any, index: number) => (
                <Card key={index} className={`p-6 ${result.isCorrect ? 'border-primary/30' : 'border-destructive/30'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    {result.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    ) : (
                      <div className="w-5 h-5 text-destructive flex-shrink-0 mt-1">✗</div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Question {index + 1}: {result.question}</h4>
                      <div className="text-sm text-muted-foreground mb-2">
                        Your answer: <span className={result.isCorrect ? 'text-primary' : 'text-destructive'}>{result.options[result.userAnswer]}</span>
                      </div>
                      {!result.isCorrect && (
                        <div className="text-sm text-primary mb-2">
                          Correct answer: {result.options[result.correctAnswer]}
                        </div>
                      )}
                      <p className="text-sm bg-muted/30 p-3 rounded">{result.explanation}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-4">
              <Link href="/modules">
                <Button variant="outline" className="flex-1" data-testid="button-back-modules">
                  Back to Modules
                </Button>
              </Link>
              {!quizResults.isPassing && (
                <Button onClick={handleRetryQuiz} className="flex-1" data-testid="button-retry">
                  Retry Quiz
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Quiz Questions */
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">{module.title} - Quiz</h2>
              <p className="text-muted-foreground">Answer all questions to complete this module</p>
              <Progress value={(Object.keys(answers).length / questions.length) * 100} className="mt-4 h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {Object.keys(answers).length} of {questions.length} answered
              </p>
            </div>

            {questionsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading questions...</div>
            ) : (
              <div className="space-y-6 mb-6">
                {questions.map((question: any, index: number) => (
                  <Card key={question.id} className="p-6">
                    <h3 className="font-semibold mb-4">
                      Question {index + 1}: {question.question}
                    </h3>
                    <RadioGroup
                      value={answers[question.id]?.toString()}
                      onValueChange={(value) => setAnswers({ ...answers, [question.id]: parseInt(value) })}
                    >
                      {question.options.map((option: string, optionIndex: number) => (
                        <div key={optionIndex} className="flex items-center space-x-2 p-3 rounded border border-border hover:border-primary/50 transition-colors">
                          <RadioGroupItem value={optionIndex.toString()} id={`${question.id}-${optionIndex}`} />
                          <Label htmlFor={`${question.id}-${optionIndex}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </Card>
                ))}
              </div>
            )}

            <Button 
              onClick={handleSubmitQuiz} 
              size="lg" 
              className="w-full glow-effect"
              disabled={Object.keys(answers).length !== questions.length || submitQuizMutation.isPending}
              data-testid="button-submit-quiz"
            >
              {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
