import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Shield, Lock, Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function PasswordTester() {
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState<any>({});

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

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setFeedback({});
      return;
    }

    const checks = {
      length: password.length >= 12,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /[0-9]/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password),
      noSequential: !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password),
      noRepeating: !/(.)\1{2,}/.test(password),
      noCommon: !['password', '12345678', 'qwerty', 'admin', 'letmein'].some(common => password.toLowerCase().includes(common))
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const calculatedStrength = Math.min(100, (passedChecks / 8) * 100);
    setStrength(calculatedStrength);
    setFeedback(checks);
  }, [password]);

  if (isLoading || !user) {
    return <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
      <div className="text-primary text-glow">Loading...</div>
    </div>;
  }

  const getStrengthLabel = () => {
    if (strength === 0) return { text: "No Password", color: "text-muted-foreground" };
    if (strength < 25) return { text: "Very Weak", color: "text-destructive" };
    if (strength < 50) return { text: "Weak", color: "text-destructive" };
    if (strength < 75) return { text: "Moderate", color: "text-secondary" };
    if (strength < 90) return { text: "Strong", color: "text-primary" };
    return { text: "Very Strong", color: "text-primary text-glow" };
  };

  const strengthLabel = getStrengthLabel();

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary text-glow">CyberGuard Academy</h1>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Button onClick={() => logout()} variant="outline" size="sm">Logout</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
            <Lock className="w-10 h-10 text-primary" />
            Password Strength Tester
          </h2>
          <p className="text-muted-foreground text-lg">Test your password strength and get real-time feedback</p>
        </div>

        <Card className="p-8 mb-6 bg-card/50 backdrop-blur">
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block">Enter Password to Test</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type a password..."
              className="text-lg py-6"
              data-testid="input-password"
            />
          </div>

          {password && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Strength:</span>
                <span className={`font-bold ${strengthLabel.color}`}>{strengthLabel.text}</span>
              </div>
              <Progress value={strength} className="h-3" />
            </div>
          )}
        </Card>

        {password && (
          <Card className="p-8 bg-card/50 backdrop-blur">
            <h3 className="text-xl font-bold mb-4">Security Checklist</h3>
            <div className="space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded ${feedback.length ? 'bg-primary/10' : 'bg-muted/30'}`}>
                {feedback.length ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : (
                  <X className="w-5 h-5 text-muted-foreground" />
                )}
                <span className={feedback.length ? 'text-foreground' : 'text-muted-foreground'}>
                  At least 12 characters long
                </span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded ${feedback.lowercase ? 'bg-primary/10' : 'bg-muted/30'}`}>
                {feedback.lowercase ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : (
                  <X className="w-5 h-5 text-muted-foreground" />
                )}
                <span className={feedback.lowercase ? 'text-foreground' : 'text-muted-foreground'}>
                  Contains lowercase letters (a-z)
                </span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded ${feedback.uppercase ? 'bg-primary/10' : 'bg-muted/30'}`}>
                {feedback.uppercase ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : (
                  <X className="w-5 h-5 text-muted-foreground" />
                )}
                <span className={feedback.uppercase ? 'text-foreground' : 'text-muted-foreground'}>
                  Contains uppercase letters (A-Z)
                </span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded ${feedback.numbers ? 'bg-primary/10' : 'bg-muted/30'}`}>
                {feedback.numbers ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : (
                  <X className="w-5 h-5 text-muted-foreground" />
                )}
                <span className={feedback.numbers ? 'text-foreground' : 'text-muted-foreground'}>
                  Contains numbers (0-9)
                </span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded ${feedback.symbols ? 'bg-primary/10' : 'bg-muted/30'}`}>
                {feedback.symbols ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : (
                  <X className="w-5 h-5 text-muted-foreground" />
                )}
                <span className={feedback.symbols ? 'text-foreground' : 'text-muted-foreground'}>
                  Contains special symbols (!@#$%^&*)
                </span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded ${feedback.noCommon ? 'bg-primary/10' : 'bg-muted/30'}`}>
                {feedback.noCommon ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : (
                  <X className="w-5 h-5 text-muted-foreground" />
                )}
                <span className={feedback.noCommon ? 'text-foreground' : 'text-muted-foreground'}>
                  Doesn't contain common words (password, admin, etc.)
                </span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded ${feedback.noSequential ? 'bg-primary/10' : 'bg-muted/30'}`}>
                {feedback.noSequential ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : (
                  <X className="w-5 h-5 text-muted-foreground" />
                )}
                <span className={feedback.noSequential ? 'text-foreground' : 'text-muted-foreground'}>
                  No sequential characters (abc, 123)
                </span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded ${feedback.noRepeating ? 'bg-primary/10' : 'bg-muted/30'}`}>
                {feedback.noRepeating ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : (
                  <X className="w-5 h-5 text-muted-foreground" />
                )}
                <span className={feedback.noRepeating ? 'text-foreground' : 'text-muted-foreground'}>
                  No repeating characters (aaa, 111)
                </span>
              </div>
            </div>

            {strength >= 75 && (
              <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Excellent Password!</h4>
                  <p className="text-sm text-muted-foreground">
                    This password meets all security requirements. Remember to use unique passwords for each account and store them securely in a password manager.
                  </p>
                </div>
              </div>
            )}

            {strength > 0 && strength < 50 && (
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-destructive mb-1">Weak Password</h4>
                  <p className="text-sm text-muted-foreground">
                    This password is vulnerable to attacks. Please improve it by adding more character types, increasing length, and avoiding common patterns.
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}

        <Card className="p-6 mt-6 bg-muted/20">
          <h3 className="text-lg font-semibold mb-3">Password Security Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use a unique password for every account</li>
            <li>• Consider using a passphrase (e.g., "Coffee-Mountain-Dance-42!")</li>
            <li>• Use a password manager to generate and store complex passwords</li>
            <li>• Enable two-factor authentication (2FA) wherever possible</li>
            <li>• Never share your passwords via email or messaging apps</li>
            <li>• Change passwords immediately if you suspect a breach</li>
          </ul>
        </Card>

        <div className="mt-6">
          <Link href="/">
            <Button variant="outline" className="w-full" data-testid="button-back-dashboard">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
