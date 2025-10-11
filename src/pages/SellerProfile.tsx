import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, User as UserIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { SellerRating } from "@/components/SellerRating";

const SellerProfile = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<any>(null);
  const [sellerItems, setSellerItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadSellerProfile();
    loadSellerItems();
    loadCurrentUser();
  }, [sellerId]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadSellerProfile = async () => {
    if (!sellerId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", sellerId)
      .single();

    if (data) {
      setSeller(data);
    }
    setLoading(false);
  };

  const loadSellerItems = async () => {
    if (!sellerId) return;

    const { data } = await supabase
      .from("items")
      .select("*, profiles(*)")
      .eq("seller_id", sellerId)
      .eq("is_sold", false)
      .order("created_at", { ascending: false });

    if (data) {
      setSellerItems(data);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">טוען...</div>
      </>
    );
  }

  if (!seller) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">מוכר לא נמצא</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-hero p-4" dir="rtl">
        <div className="max-w-6xl mx-auto py-8 space-y-6">
          {/* Seller Info Card */}
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={seller.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    <UserIcon className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">{seller.username}</CardTitle>
                    {seller.is_face_verified && (
                      <Badge className="bg-sage/95 text-white">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        מאומת
                      </Badge>
                    )}
                  </div>
                  {seller.full_name && (
                    <p className="text-muted-foreground">{seller.full_name}</p>
                  )}
                  {seller.bio && (
                    <p className="text-sm mt-2">{seller.bio}</p>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Seller Rating */}
          <SellerRating sellerId={sellerId!} currentUserId={currentUser?.id} />

          {/* Seller Items */}
          <Card className="shadow-card bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>פריטים למכירה ({sellerItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {sellerItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sellerItems.map((item) => (
                    <ProductCard
                      key={item.id}
                      id={item.id}
                      image={item.images?.[0]}
                      title={item.title}
                      brand={item.brand}
                      price={item.price}
                      location={seller.username}
                      verified={seller.is_face_verified}
                      shippingMethods={item.shipping_method || []}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  אין פריטים זמינים למכירה כרגע
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SellerProfile;
