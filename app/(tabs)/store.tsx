import { useEffect } from "react";
import { SafeAreaView, ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";
import { toast } from "../../src/lib/toast";
import { Ionicons } from "@expo/vector-icons";

export default function StoreScreen() {
  const router = useRouter();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const storeItems = useQuery(api.store.getStoreItems);
  const userPurchases = useQuery(api.store.getUserPurchases);
  const purchaseItem = useMutation(api.store.purchaseItem);

  // Authentication guard
  useEffect(() => {
    if (loggedInUser === null) {
      router.replace("/(auth)/login");
    }
  }, [loggedInUser, router]);

  // Show loading while checking authentication
  if (loggedInUser === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff701a" />
          <Text className="text-gray-400 mt-4">در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading if not authenticated (will redirect)
  if (loggedInUser === null) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff701a" />
          <Text className="text-gray-400 mt-4">در حال انتقال به صفحه ورود...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePurchase = async (itemId: string) => {
    try {
      await purchaseItem({ itemId });
      toast.success("خرید با موفقیت انجام شد!");
    } catch (error: any) {
      toast.error(error.message || "خطا در انجام خرید");
    }
  };

  const isItemPurchased = (itemId: any) => {
    if (!userPurchases) return false;
    const purchase = userPurchases.find(p => p.itemId === itemId);
    if (!purchase) return false;
    const now = Date.now();
    const expiresAt = purchase.purchasedAt + purchase.durationMs;
    return expiresAt > now;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 space-y-6">
          <View className="bg-background-light rounded-lg p-6 border border-gray-600">
            <Text className="text-2xl font-bold text-white text-right mb-2" style={{ fontFamily: 'Vazirmatn-Bold' }}>
              فروشگاه
            </Text>
            <Text className="text-gray-400 text-right" style={{ fontFamily: 'Vazirmatn-Regular' }}>
              آیتم‌های ویژه برای بهبود تجربه بازی شما
            </Text>
          </View>

          {storeItems === undefined ? (
            <View className="flex items-center justify-center py-8">
              <ActivityIndicator size="large" color="#ff701a" />
            </View>
          ) : storeItems.length === 0 ? (
            <View className="bg-background-light rounded-lg p-6 border border-gray-600">
              <Text className="text-gray-400 text-center" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                در حال حاضر آیتمی در فروشگاه موجود نیست
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {storeItems.map((item) => {
                const purchased = isItemPurchased(item._id);
                const purchase = userPurchases?.find(p => p.itemId === item._id);
                const now = Date.now();
                const expiresAt = purchase ? purchase.purchasedAt + purchase.durationMs : 0;
                const isActive = purchased && expiresAt > now;
                const timeRemaining = isActive ? expiresAt - now : 0;
                const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                return (
                  <View
                    key={item._id}
                    className={`bg-background-light rounded-lg p-6 border ${
                      isActive ? "border-accent/50 bg-accent/10" : "border-gray-600"
                    }`}
                  >
                    <View className="flex-row items-start justify-between mb-4">
                      <View className="flex-1">
                        <Text className="text-xl font-bold text-white text-right mb-2" style={{ fontFamily: 'Vazirmatn-Bold' }}>
                          {item.name}
                        </Text>
                        {item.description && item.description.trim() && (
                          <Text className="text-gray-300 text-right mb-4" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                            {item.description}
                          </Text>
                        )}
                        
                        {/* Price */}
                        <View className="bg-accent/10 rounded-lg p-3 mb-4 border border-accent/30">
                          <Text className="text-accent font-bold text-lg text-center" style={{ fontFamily: 'Vazirmatn-Bold' }}>
                            {item.price.toLocaleString('fa-IR')} امتیاز
                          </Text>
                        </View>

                        {/* Status */}
                        {isActive && (
                          <View className="bg-accent/20 rounded-lg p-3 border border-accent/30 mb-4">
                            <Text className="text-accent text-sm text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                              ✓ فعال تا {daysRemaining > 0 ? `${daysRemaining} روز و ` : ''}{hoursRemaining} ساعت دیگر
                            </Text>
                          </View>
                        )}

                        {purchased && !isActive && (
                          <View className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 mb-4">
                            <Text className="text-gray-400 text-sm text-right" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                              منقضی شده - می‌توانید دوباره خریداری کنید
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => handlePurchase(item._id)}
                      disabled={isActive}
                      activeOpacity={0.7}
                      className={`rounded-lg p-4 ${
                        isActive
                          ? "bg-gray-700/50 border border-gray-600"
                          : "bg-accent border border-accent"
                      }`}
                    >
                      <Text
                        className={`text-center font-bold text-lg ${
                          isActive ? "text-gray-400" : "text-white"
                        }`}
                        style={{ fontFamily: 'Vazirmatn-Bold' }}
                      >
                        {isActive ? "در حال استفاده" : "خریداری"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

