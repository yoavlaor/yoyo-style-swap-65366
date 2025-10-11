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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

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
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<"email" | "sms">("email");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast({
        title: "יש לאשר את התקנון",
        description: "עליך לקרוא ולאשר את תקנון השימוש כדי להירשם",
        variant: "destructive",
      });
      return;
    }

    if (!phone || !address) {
      toast({
        title: "שדות חסרים",
        description: "יש למלא טלפון וכתובת",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    const { error } = await supabase.auth.signUp({
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
      // Send OTP for verification
      setOtpSent(true);
      toast({
        title: "נרשמת בהצלחה!",
        description: `קוד אימות נשלח ל${verificationMethod === "email" ? "אימייל" : "טלפון"} שלך`,
      });
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      toast({
        title: "שגיאה באימות",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    } else {
      // Update profile with phone verification
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          phone,
          address,
          is_phone_verified: true
        }).eq('id', user.id);
      }
      
      toast({
        title: "אומת בהצלחה! 🎉",
        description: "ברוכים הבאים ליויו",
      });
      navigate("/");
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
          <CardTitle className="text-2xl text-center">✨ יויו ✨</CardTitle>
          <CardDescription className="text-center">
            בואו נצא למסע אופנה ירוק ביחד! 🌿
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" dir="rtl">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">כניסה 🔑</TabsTrigger>
              <TabsTrigger value="signup">הצטרפות 🌟</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">מה האימייל? 📧</Label>
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
                  <Label htmlFor="signin-password">מה הסיסמה? 🔒</Label>
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
                  {loading ? "רגע... 🌿" : "בואו נכנס! ✨"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              {!otpSent ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">איך נקרא לך? ✏️</Label>
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
                    <Label htmlFor="signup-email">מה האימייל? 📧</Label>
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
                    <Label htmlFor="signup-phone">מה הטלפון? 📱</Label>
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
                    <Label htmlFor="signup-address">מה הכתובת? 🏠</Label>
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
                    <Label htmlFor="signup-password">בחרו סיסמה 🔒</Label>
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
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      קראתי ואני מאשר/ת את{" "}
                      <TermsOfService>
                        <button type="button" className="text-primary underline hover:text-primary/80">
                          תקנון השימוש
                        </button>
                      </TermsOfService>
                      {" "}של יויו 📜
                    </Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || !agreedToTerms}>
                    {loading ? "רגע... 🌱" : "בואו נצטרף! 🎉"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2 text-center">
                    <Label>הזינו את קוד האימות 🔐</Label>
                    <p className="text-sm text-muted-foreground">
                      שלחנו קוד ל{email}
                    </p>
                    <div className="flex justify-center py-4">
                      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                    {loading ? "מאמת... ⏳" : "אמת קוד ✓"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => setOtpSent(false)}
                  >
                    חזרה
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;