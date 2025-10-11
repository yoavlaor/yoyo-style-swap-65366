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

    if (verificationMethod === "sms") {
      // Format phone number to international format
      const formattedPhone = phone.startsWith('+') ? phone : `+972${phone.replace(/^0/, '')}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: {
            username,
            email,
            address,
          }
        }
      });

      if (error) {
        toast({
          title: "שגיאה בשליחת SMS",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
      } else {
        setOtpSent(true);
        toast({
          title: "קוד נשלח!",
          description: "קוד אימות נשלח לטלפון שלך דרך SMS",
        });
        setLoading(false);
      }
    } else {
      // Email verification
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
        setOtpSent(true);
        toast({
          title: "נרשמת בהצלחה!",
          description: "קוד אימות נשלח לאימייל שלך",
        });
        setLoading(false);
      }
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let verifyOptions;
    if (verificationMethod === "sms") {
      const formattedPhone = phone.startsWith('+') ? phone : `+972${phone.replace(/^0/, '')}`;
      verifyOptions = {
        phone: formattedPhone,
        token: otp,
        type: 'sms' as const,
      };
    } else {
      verifyOptions = {
        email,
        token: otp,
        type: 'email' as const,
      };
    }

    const { error } = await supabase.auth.verifyOtp(verifyOptions);

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
          is_phone_verified: verificationMethod === "sms"
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
                  <div className="space-y-3">
                    <Label>איך תרצו לקבל את קוד האימות? 📲</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={verificationMethod === "email" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => setVerificationMethod("email")}
                      >
                        📧 אימייל
                      </Button>
                      <Button
                        type="button"
                        variant={verificationMethod === "sms" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => setVerificationMethod("sms")}
                      >
                        📱 SMS
                      </Button>
                    </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="otp-code">הזינו את קוד האימות 🔐</Label>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      שלחנו קוד בן 6 ספרות {verificationMethod === "email" ? `לאימייל ${email}` : `לטלפון ${phone}`}
                    </p>
                    <Input
                      id="otp-code"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      dir="ltr"
                      className="text-center text-2xl tracking-widest font-mono"
                      required
                    />
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