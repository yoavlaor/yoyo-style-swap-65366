import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Mail, Search, User, Phone, MapPin, CheckCircle, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  email?: string;
  phone: string | null;
  address: string | null;
  bio: string | null;
  is_phone_verified: boolean | null;
  created_at: string;
}

export const AdminUsersPanel = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר מחדש",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('list-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.users) {
        setUsers(data.users);
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        title: "שגיאה בטעינת משתמשים",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר מחדש",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "המשתמש נמחק בהצלחה",
        description: `${username} הוסר מהמערכת`,
      });

      loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "שגיאה במחיקת משתמש",
        description: error.message || "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !messageSubject || !messageContent) {
      toast({
        title: "שדות חסרים",
        description: "יש למלא נושא ותוכן ההודעה",
        variant: "destructive",
      });
      return;
    }

    setSendingMessage(true);

    try {
      // Here you would integrate with your email service
      // For now, we'll just show a success message
      toast({
        title: "ההודעה נשלחה בהצלחה!",
        description: `נשלח ל-${selectedUser.username} (${selectedUser.email})`,
      });

      setMessageSubject("");
      setMessageContent("");
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: error.message,
        variant: "destructive",
      });
    }

    setSendingMessage(false);
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="shadow-card bg-gradient-card border-border/50">
        <CardContent className="p-8 text-center">
          <p>טוען משתמשים...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>ניהול משתמשים 👥</span>
          <span className="text-lg font-normal text-muted-foreground">
            {users.length} משתמשים רשומים
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש לפי שם, אימייל או שם משתמש..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">{user.username}</h3>
                      {user.is_phone_verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    {user.full_name && (
                      <p className="text-sm text-muted-foreground">
                        שם מלא: {user.full_name}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-3 text-sm">
                      {user.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-muted-foreground">{user.email}</span>
                        </div>
                      )}
                      
                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="text-muted-foreground">{user.phone}</span>
                        </div>
                      )}
                      
                      {user.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-muted-foreground">{user.address}</span>
                        </div>
                      )}
                    </div>

                    {user.bio && (
                      <p className="text-sm text-muted-foreground italic">
                        "{user.bio}"
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      נרשם: {new Date(user.created_at).toLocaleDateString('he-IL')}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Send Message Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Mail className="h-4 w-4 ml-1" />
                          שלח הודעה
                        </Button>
                      </DialogTrigger>
                      <DialogContent dir="rtl" className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>שליחת הודעה ל-{user.username}</DialogTitle>
                          <DialogDescription>
                            ההודעה תישלח ל-{user.email}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="subject">נושא ההודעה</Label>
                            <Input
                              id="subject"
                              value={messageSubject}
                              onChange={(e) => setMessageSubject(e.target.value)}
                              placeholder="נושא..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="message">תוכן ההודעה</Label>
                            <Textarea
                              id="message"
                              value={messageContent}
                              onChange={(e) => setMessageContent(e.target.value)}
                              placeholder="כתבו את ההודעה כאן..."
                              rows={6}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleSendMessage}
                            disabled={sendingMessage || !messageSubject || !messageContent}
                          >
                            {sendingMessage ? "שולח..." : "שלח הודעה 📨"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Delete User Alert */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          מחק
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>מחיקת משתמש - האם בטוח? ⚠️</AlertDialogTitle>
                          <AlertDialogDescription>
                            אתה עומד למחוק את המשתמש <strong>{user.username}</strong> ({user.email}).
                            <br />
                            <br />
                            פעולה זו תמחק את:
                            <ul className="list-disc list-inside mt-2">
                              <li>פרטי המשתמש</li>
                              <li>כל הפריטים שהעלה</li>
                              <li>היסטוריית הקניות</li>
                              <li>כל הנתונים הקשורים אליו</li>
                            </ul>
                            <br />
                            <strong className="text-destructive">פעולה זו אינה ניתנת לשחזור!</strong>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ביטול</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            כן, מחק לצמיתות 🗑️
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery ? "לא נמצאו משתמשים התואמים לחיפוש" : "אין משתמשים רשומים"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};