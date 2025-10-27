import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadChat();
        loadMessages();
        subscribeToMessages();
      } else {
        navigate("/auth");
      }
    });

    return () => {
      supabase.channel(`chat-${chatId}`).unsubscribe();
    };
  }, [chatId, navigate]);

  const loadChat = async () => {
    const { data, error } = await supabase
      .from("chats")
      .select("*, items(*), buyer:profiles!chats_buyer_id_fkey(*), seller:profiles!chats_seller_id_fkey(*)")
      .eq("id", chatId)
      .single();

    if (data) {
      setChat(data);
    }
    setLoading(false);
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNewMessage("");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  }

  if (!chat) {
    return <div className="min-h-screen flex items-center justify-center">צ'אט לא נמצא</div>;
  }

  const otherUser = user?.id === chat.buyer_id ? chat.seller : chat.buyer;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-hero pb-24" dir="rtl">
        <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col p-4">
          <Card className="flex-1 flex flex-col shadow-card bg-gradient-card border-border/50">
            <CardHeader className="border-b bg-background/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    💬 {chat.items?.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    בשיחה עם {otherUser?.username} 🌿
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    🤖 מנוע חיפוש מופעל על ידי בינה מלאכותית
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate("/profile")}>
                  חזרה
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/30">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-3 shadow-soft ${
                      message.sender_id === user?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-border"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>

            <div className="border-t p-4 bg-background/50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="שתפו מחשבה... 💭"
                  className="flex-1 bg-background"
                />
                <Button type="submit" size="icon" className="shadow-warm">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Chat;