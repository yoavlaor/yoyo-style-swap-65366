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
        title: "נרשמת בהצלחה!",
        description: "שלחנו לך אימייל לאימות. אנא בדוק את תיבת הדואר ולחץ על הקישור כדי להיכנס 📧",
        duration: 8000,
      });
      setLoading(false);
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
      <Card className="w-full max-w-xl shadow-2xl border-border/50">
        <CardHeader className="space-y-6 pb-8">
          <CardTitle className="text-5xl md:text-6xl font-black text-center bg-gradient-primary bg-clip-text text-transparent">
            YOYO
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Tabs defaultValue="signin" dir="rtl">
            <TabsList className="grid w-full grid-cols-2 h-14 bg-muted rounded-xl">
              <TabsTrigger value="signin" className="text-lg font-semibold rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md">כניסה</TabsTrigger>
              <TabsTrigger value="signup" className="text-lg font-semibold rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md">הצטרפות</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-base font-medium">מה האימייל?</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="example@email.com"
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-base font-medium">מה הסיסמה?</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    dir="ltr"
                    className="h-12 text-base"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={loading}>
                  {loading ? "רגע..." : "בואו נכנס"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-base font-medium">איך נקרא לך?</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    dir="rtl"
                    placeholder="שם משתמש מגניב"
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-base font-medium">מה האימייל?</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="example@email.com"
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone" className="text-base font-medium">מה הטלפון?</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="05X-XXXXXXX"
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-address" className="text-base font-medium">מה הכתובת?</Label>
                  <Input
                    id="signup-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    dir="rtl"
                    placeholder="רחוב, עיר"
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-base font-medium">בחרו סיסמה</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    dir="ltr"
                    placeholder="לפחות 6 תווים"
                    className="h-12 text-base"
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
                  className="w-full h-12 text-lg font-semibold" 
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