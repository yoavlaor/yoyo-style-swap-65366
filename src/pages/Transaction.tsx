import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Package, CreditCard, CheckCircle } from "lucide-react";
import { PaymentMethodSelector } from "@/components/transaction/PaymentMethodSelector";
import { PaymentProofUpload } from "@/components/transaction/PaymentProofUpload";
import { CashMeeting } from "@/components/transaction/CashMeeting";
import { SellerConfirmation } from "@/components/transaction/SellerConfirmation";
import { DeliveryConfirmation } from "@/components/transaction/DeliveryConfirmation";
import { RatingModal } from "@/components/transaction/RatingModal";
import { TransactionChat } from "@/components/transaction/TransactionChat";

interface Transaction {
  id: string;
  item_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  price_agreed: number;
  payment_method: string | null;
  status: string;
  created_at: string;
  items: {
    title: string;
    images: string[];
    price: number;
  };
  buyer_profile: {
    username: string;
    avatar_url: string;
  };
  seller_profile: {
    username: string;
    avatar_url: string;
    bit_number: string;
    paybox_handle: string;
  };
}

const statusColors = {
  started: "bg-muted",
  waiting_for_payment_proof: "bg-orange-500",
  waiting_seller_confirmation: "bg-blue-500",
  meeting_scheduled: "bg-purple-500",
  ready_to_deliver: "bg-green-500",
  delivered_unconfirmed: "bg-cyan-500",
  completed: "bg-teal-500",
  payment_disputed: "bg-red-500",
};

const statusLabels = {
  started: "התחיל",
  waiting_for_payment_proof: "ממתין לאישור תשלום",
  waiting_seller_confirmation: "ממתין לאישור המוכר",
  meeting_scheduled: "נקבעה פגישה",
  ready_to_deliver: "מוכן למסירה",
  delivered_unconfirmed: "נמסר - ממתין לאישור",
  completed: "הושלם",
  payment_disputed: "תשלום שנוי במחלוקת",
};

export default function Transaction() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [transactionId]);

  const loadTransaction = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          items (title, images, price),
          buyer_profile:profiles!transactions_buyer_id_fkey (username, avatar_url),
          seller_profile:profiles!transactions_seller_id_fkey (username, avatar_url, bit_number, paybox_handle)
        `)
        .eq("id", transactionId)
        .single();

      if (error) throw error;
      setTransaction(data);
      
      // Show rating modal if completed and user hasn't rated yet
      if (data.status === "completed") {
        const { data: existingRating } = await supabase
          .from("transaction_ratings")
          .select("id")
          .eq("transaction_id", transactionId)
          .eq("from_user_id", user.id)
          .single();
        
        if (!existingRating) {
          setShowRatingModal(true);
        }
      }
    } catch (error: any) {
      console.error("Error loading transaction:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את הטרנזקציה",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (status: string) => {
    const steps = {
      started: 10,
      waiting_for_payment_proof: 25,
      waiting_seller_confirmation: 40,
      meeting_scheduled: 40,
      ready_to_deliver: 60,
      delivered_unconfirmed: 80,
      completed: 100,
      payment_disputed: 40,
    };
    return steps[status as keyof typeof steps] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">טוען...</div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>טרנזקציה לא נמצאה</p>
        </div>
      </div>
    );
  }

  const isBuyer = currentUserId === transaction.buyer_id;
  const isSeller = currentUserId === transaction.seller_id;
  const otherUser = isBuyer ? transaction.seller_profile : transaction.buyer_profile;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Status Banner */}
        {transaction.status === "payment_disputed" && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg mb-6 text-center">
            ⚠️ תשלום שנוי במחלוקת - אנא תקשרו בצ'אט לפתרון הבעיה
          </div>
        )}

        {/* Transaction Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <img
              src={transaction.items.images[0] || "/placeholder.svg"}
              alt={transaction.items.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{transaction.items.title}</h1>
              <p className="text-muted-foreground mb-2">
                {isBuyer ? "מוכר" : "קונה"}: {otherUser.username}
              </p>
              <p className="text-xl font-semibold">₪{transaction.amount}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">סטטוס</span>
              <Badge className={statusColors[transaction.status as keyof typeof statusColors]}>
                {statusLabels[transaction.status as keyof typeof statusLabels]}
              </Badge>
            </div>
            <Progress value={getProgressPercentage(transaction.status)} className="h-2" />
          </div>
        </Card>

        {/* Action Area Based on Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            {transaction.status === "started" && isBuyer && (
              <PaymentMethodSelector
                transactionId={transaction.id}
                onMethodSelected={loadTransaction}
              />
            )}

            {transaction.payment_method && transaction.payment_method !== "cash" && 
             transaction.status === "started" && isBuyer && (
              <PaymentProofUpload
                transactionId={transaction.id}
                paymentMethod={transaction.payment_method}
                amount={transaction.amount}
                sellerPaymentInfo={{
                  bit_number: transaction.seller_profile.bit_number,
                  paybox_handle: transaction.seller_profile.paybox_handle,
                }}
                onProofUploaded={loadTransaction}
              />
            )}

            {transaction.payment_method === "cash" && transaction.status === "started" && isBuyer && (
              <CashMeeting
                transactionId={transaction.id}
                onMeetingScheduled={loadTransaction}
              />
            )}

            {transaction.status === "waiting_seller_confirmation" && isSeller && (
              <SellerConfirmation
                transactionId={transaction.id}
                onConfirmed={loadTransaction}
              />
            )}

            {(transaction.status === "ready_to_deliver" || transaction.status === "delivered_unconfirmed") && (
              <DeliveryConfirmation
                transactionId={transaction.id}
                isBuyer={isBuyer}
                isSeller={isSeller}
                onConfirmed={loadTransaction}
              />
            )}
          </div>

          {/* Chat Section */}
          <div>
            <TransactionChat
              transactionId={transaction.id}
              chatId={transaction.id}
              currentUserId={currentUserId}
              otherUserId={isBuyer ? transaction.seller_id : transaction.buyer_id}
              otherUsername={otherUser.username}
            />
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">שיטת תשלום</p>
            <p className="text-xs text-muted-foreground">
              {transaction.payment_method === "bit" && "Bit"}
              {transaction.payment_method === "paybox" && "PayBox"}
              {transaction.payment_method === "cash" && "מזומן"}
              {!transaction.payment_method && "טרם נבחרה"}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">מצב משלוח</p>
            <p className="text-xs text-muted-foreground">
              {transaction.status === "completed" ? "נמסר בהצלחה" : "בתהליך"}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">תקשורת</p>
            <p className="text-xs text-muted-foreground">צ'אט פעיל</p>
          </Card>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && transaction.status === "completed" && (
        <RatingModal
          transactionId={transaction.id}
          fromUserId={currentUserId}
          toUserId={isBuyer ? transaction.seller_id : transaction.buyer_id}
          toUsername={otherUser.username}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
}
