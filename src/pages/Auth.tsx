import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { TermsOfService } from "@/components/TermsOfService";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!username || !email || !phone || !address || !password) {
      toast({
        title: "שדות חסרים",
        description: "יש למלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "חובה לאשר את התקנון",
        description: "עליך לקרוא ולאשר את תקנון השימוש כדי להירשם",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          username,
          phone,
          address,
        },
      },
    });

    if (error) {
      toast({
        title: "שגיאה בהרשמה",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    } else {
      toast({
        title: "נרשמת בהצלחה",
        description: "שלחנו לך אימייל לאימות. אנא בדקו את תיבת הדואר ולחצו על הקישור לאימות כדי להתחבר.",
        duration: 8000,
      });
      
      setLoading(false);
      // Don't navigate - user needs to verify email first
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "שגיאה בהתחברות",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">יויו</CardTitle>
          <CardDescription className="text-center">
            בואו נצא למסע אופנה ירוק ביחד
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" dir="rtl">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">כניסה</TabsTrigger>
              <TabsTrigger value="signup">הצטרפות</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">מה האימייל?</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="example@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">מה הסיסמה?</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    dir="ltr"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "רגע..." : "בואו נכנס"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">איך נקרא לך?</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    dir="rtl"
                    placeholder="שם משתמש מגניב"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">מה האימייל?</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="example@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">מה הטלפון?</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="05X-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-address">מה הכתובת?</Label>
                  <Input
                    id="signup-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    dir="rtl"
                    placeholder="רחוב, עיר"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">בחרו סיסמה</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    dir="ltr"
                    placeholder="לפחות 6 תווים"
                  />
                </div>
                <div className="flex items-start gap-3 py-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="mt-1"
                    required
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    <span className="text-destructive">* </span>
                    קראתי ואני מאשר/ת את{" "}
                    <TermsOfService>
                      <button type="button" className="text-primary underline hover:text-primary/80">
                        תקנון השימוש
                      </button>
                    </TermsOfService>
                    {" "}של יויו <span className="text-destructive font-bold">(חובה)</span>
                  </Label>
                </div>
                {!agreedToTerms && (
                  <p className="text-sm text-destructive text-center">
                    חובה לאשר את התקנון כדי להמשיך
                  </p>
                )}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !agreedToTerms || !username || !email || !phone || !address || !password}
                >
                  {loading ? "רגע..." : "בואו נצא לדרך"}
                </Button>
                {(!username || !email || !phone || !address || !password) && (
                  <p className="text-sm text-muted-foreground text-center">
                    נא למלא את כל השדות כדי להמשיך
                  </p>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;