import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Shield, Mail, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const phishingEmails = [
  {
    id: "email1",
    from: "noreply@paypa1-secure.com",
    subject: "URGENT: Your Account Has Been Suspended",
    body: `Dear Valued Customer,

We have detected unusual activity on your PayPal account. Your account has been temporarily suspended for your protection.

To restore full access, please verify your information immediately by clicking the link below:

http://paypal-secure-verification.tk/verify

If you do not verify within 24 hours, your account will be permanently closed.

Sincerely,
PayPal Security Team`,
    threats: ["suspicious_sender", "urgency", "suspicious_link", "threat"],
    category: "Account Verification Scam"
  },
  {
    id: "email2",
    from: "ceo@company.com",
    subject: "Re: Urgent Wire Transfer Needed",
    body: `Hi,

I'm currently in a meeting with investors and need you to process an urgent wire transfer immediately.

Transfer $15,000 to this account:
Bank: International Trust Bank
Account: 98743210987
Swift: ITBXYZ123

This is time-sensitive - please handle this ASAP and confirm once done.

Thanks,
John Smith
CEO`,
    threats: ["urgency", "authority", "unusual_request", "no_verification"],
    category: "CEO Fraud"
  },
  {
    id: "email3",
    from: "delivery@ups-tracking.net",
    subject: "Package Delivery Failed - Action Required",
    body: `Hello,

We attempted to deliver your package today but were unable to complete the delivery.

Tracking Number: UPS827463891

To reschedule delivery, please download and complete the attached form:

[Download Delivery Form]

Please note: This link expires in 48 hours.

UPS Customer Service`,
    threats: ["suspicious_sender", "fake_attachment", "urgency", "suspicious_link"],
    category: "Delivery Scam"
  }
];

const allThreats = [
  { id: "suspicious_sender", label: "Suspicious sender email address" },
  { id: "urgency", label: "Creates false urgency or panic" },
  { id: "suspicious_link", label: "Suspicious or misspelled link" },
  { id: "threat", label: "Threatens account closure/suspension" },
  { id: "authority", label: "Impersonates authority figure" },
  { id: "unusual_request", label: "Unusual financial request" },
  { id: "no_verification", label: "No way to verify independently" },
  { id: "fake_attachment", label: "Unexpected attachment request" },
];

export default function PhishingSimulator() {
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [selectedThreats, setSelectedThreats] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

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

  const submitAttemptMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/phishing-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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

  const currentEmail = phishingEmails[currentEmailIndex];

  const handleToggleThreat = (threatId: string) => {
    setSelectedThreats(prev =>
      prev.includes(threatId)
        ? prev.filter(t => t !== threatId)
        : [...prev, threatId]
    );
  };

  const handleSubmit = () => {
    const correctThreats = currentEmail.threats;
    const detected = selectedThreats.filter(t => correctThreats.includes(t));
    const missed = correctThreats.filter(t => !selectedThreats.includes(t));
    const falsePositives = selectedThreats.filter(t => !correctThreats.includes(t));
    
    const calculatedScore = Math.round(
      ((detected.length / correctThreats.length) * 100) - (falsePositives.length * 10)
    );
    const finalScore = Math.max(0, calculatedScore);
    
    setScore(finalScore);
    setShowResults(true);

    submitAttemptMutation.mutate({
      emailId: currentEmail.id,
      detectedThreats: detected,
      missedThreats: missed,
      score: finalScore,
    });
  };

  const handleNext = () => {
    if (currentEmailIndex < phishingEmails.length - 1) {
      setCurrentEmailIndex(prev => prev + 1);
      setSelectedThreats([]);
      setShowResults(false);
    }
  };

  const handleRestart = () => {
    setCurrentEmailIndex(0);
    setSelectedThreats([]);
    setShowResults(false);
  };

  if (isLoading || !user) {
    return <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
      <div className="text-primary text-glow">Loading...</div>
    </div>;
  }

  const correctThreats = currentEmail.threats;
  const detected = selectedThreats.filter(t => correctThreats.includes(t));
  const missed = correctThreats.filter(t => !selectedThreats.includes(t));

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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-3 flex items-center gap-3">
            <Mail className="w-10 h-10 text-primary" />
            Phishing Email Simulator
          </h2>
          <p className="text-muted-foreground text-lg">Identify suspicious elements in phishing emails</p>
          <Badge className="mt-2">Email {currentEmailIndex + 1} of {phishingEmails.length}</Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Email Display */}
          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="mb-4">
              <Badge className="mb-3 bg-destructive/20 text-destructive border-destructive/30">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Phishing Email
              </Badge>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-muted/30 rounded">
                <div className="text-sm text-muted-foreground mb-1">From:</div>
                <div className="font-mono text-sm">{currentEmail.from}</div>
              </div>
              
              <div className="p-3 bg-muted/30 rounded">
                <div className="text-sm text-muted-foreground mb-1">Subject:</div>
                <div className="font-semibold">{currentEmail.subject}</div>
              </div>
            </div>

            <div className="p-4 bg-background/50 rounded border border-border min-h-[300px] font-mono text-sm whitespace-pre-line">
              {currentEmail.body}
            </div>
          </Card>

          {/* Threat Selection */}
          <div>
            {!showResults ? (
              <Card className="p-6 bg-card/50 backdrop-blur">
                <h3 className="text-xl font-bold mb-4">Identify Phishing Indicators</h3>
                <p className="text-muted-foreground mb-6">Select all suspicious elements you can find:</p>
                
                <div className="space-y-3 mb-6">
                  {allThreats.map(threat => (
                    <div key={threat.id} className="flex items-center space-x-2 p-3 rounded border border-border hover:border-primary/50 transition-colors">
                      <Checkbox
                        id={threat.id}
                        checked={selectedThreats.includes(threat.id)}
                        onCheckedChange={() => handleToggleThreat(threat.id)}
                      />
                      <Label htmlFor={threat.id} className="flex-1 cursor-pointer">
                        {threat.label}
                      </Label>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full glow-effect"
                  disabled={selectedThreats.length === 0}
                  data-testid="button-submit-analysis"
                >
                  Submit Analysis
                </Button>
              </Card>
            ) : (
              <Card className={`p-6 ${score >= 80 ? 'bg-gradient-to-br from-primary/20 to-card/50 border-primary/30' : 'bg-card/50'}`}>
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold mb-2 text-primary text-glow">{score}%</div>
                  <h3 className="text-2xl font-bold mb-2">
                    {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good Job!' : 'Keep Learning!'}
                  </h3>
                  <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                    {currentEmail.category}
                  </Badge>
                </div>

                <div className="space-y-4 mb-6">
                  {detected.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                        Correctly Identified ({detected.length})
                      </h4>
                      <div className="space-y-1">
                        {detected.map(threat => (
                          <div key={threat} className="text-sm p-2 bg-primary/10 rounded">
                            • {allThreats.find(t => t.id === threat)?.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {missed.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                        <XCircle className="w-4 h-4" />
                        Missed Threats ({missed.length})
                      </h4>
                      <div className="space-y-1">
                        {missed.map(threat => (
                          <div key={threat} className="text-sm p-2 bg-destructive/10 rounded">
                            • {allThreats.find(t => t.id === threat)?.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {currentEmailIndex < phishingEmails.length - 1 ? (
                    <Button onClick={handleNext} className="flex-1" data-testid="button-next-email">
                      Next Email
                    </Button>
                  ) : (
                    <Button onClick={handleRestart} className="flex-1" data-testid="button-restart">
                      Restart Simulation
                    </Button>
                  )}
                  <Link href="/">
                    <Button variant="outline" data-testid="button-dashboard">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
