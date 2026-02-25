import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "../../../lib/toast";
import { Button } from "../../../components/ui";
import { Ionicons } from "@expo/vector-icons";

/**
 * Admin Settings: فقط انتخاب استادیوم و مربی پیش‌فرض.
 * نام و تصویر در تب فروشگاه هنگام ایجاد/ویرایش آیتم تنظیم می‌شود.
 */
export function AdminSettingsTab() {
  const appSettings = useQuery(api.settings.getAppSettings);
  const allStoreItems = useQuery(api.store.getAllStoreItems);
  const setAppSettings = useMutation(api.settings.setAppSettings);
  const assignToAllUsers = useMutation(api.settings.assignDefaultStadiumAndMentorToAllUsers);

  const stadiumItems = (allStoreItems || []).filter((i: any) => i.itemType === "stadium");
  const mentorItems = (allStoreItems || []).filter((i: any) => i.itemType === "mentor");

  const [defaultStadiumId, setDefaultStadiumId] = useState<Id<"storeItems"> | null>(null);
  const [defaultMentorId, setDefaultMentorId] = useState<Id<"storeItems"> | null>(null);
  const [isAssigningAll, setIsAssigningAll] = useState(false);

  useEffect(() => {
    if (appSettings) {
      setDefaultStadiumId(appSettings.defaultStadiumItemId ?? null);
      setDefaultMentorId(appSettings.defaultMentorItemId ?? null);
    }
  }, [appSettings]);

  const handleSelectStadium = async (itemId: Id<"storeItems">) => {
    setDefaultStadiumId(itemId);
    try {
      await setAppSettings({ defaultStadiumItemId: itemId });
      toast.success("استادیوم پیش‌فرض انتخاب شد");
    } catch {
      toast.error("خطا در ذخیره");
    }
  };

  const handleSelectMentor = async (itemId: Id<"storeItems">) => {
    setDefaultMentorId(itemId);
    try {
      await setAppSettings({ defaultMentorItemId: itemId });
      toast.success("مربی پیش‌فرض انتخاب شد");
    } catch {
      toast.error("خطا در ذخیره");
    }
  };

  const handleAssignToAllUsers = async () => {
    setIsAssigningAll(true);
    try {
      const result = await assignToAllUsers();
      toast.success(`اعمال شد: ${result.assignedStadium} استادیوم، ${result.assignedMentor} مربی برای ${result.totalUsers} کاربر`);
    } catch (e: any) {
      toast.error(e?.message || "خطا");
    } finally {
      setIsAssigningAll(false);
    }
  };

  if (appSettings === undefined) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-400">در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
      <Text className="text-2xl font-bold text-white mb-2 text-right" style={{ fontFamily: "Meem-Bold" }}>
        تنظیمات
      </Text>
      <Text className="text-gray-400 text-right mb-6">
        فقط استادیوم و مربی پیش‌فرض را انتخاب کنید. نام و تصویر در تب فروشگاه تنظیم می‌شود.
      </Text>

      {/* استادیوم پیش‌فرض */}
      <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6 mb-6">
        <Text className="text-lg font-semibold text-white mb-3 text-right">استادیوم پیش‌فرض</Text>
        <Text className="text-gray-400 text-sm mb-4 text-right">به کاربران جدید هنگام ثبت‌نام داده می‌شود.</Text>
        {stadiumItems.length === 0 ? (
          <Text className="text-gray-500 py-2 text-right">هیچ آیتم استادیومی وجود ندارد. از تب فروشگاه یکی بسازید.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {stadiumItems.map((item: any) => {
              const imageUrl = item.imageStorageId ? null : item.imagePath?.startsWith("http") ? item.imagePath : null;
              return (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => handleSelectStadium(item._id)}
                  className={`rounded-xl border overflow-hidden ${defaultStadiumId === item._id ? "border-accent bg-accent/10" : "border-gray-600 bg-gray-800/50"}`}
                  style={{ width: 120 }}
                >
                  <View className="h-20 bg-gray-700/50 items-center justify-center">
                    {item.imageStorageId ? (
                      <StoreItemImage storageId={item.imageStorageId} />
                    ) : imageUrl ? (
                      <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Ionicons name="storefront" size={32} color="#6b7280" />
                    )}
                  </View>
                  <Text className={`p-2 text-center text-sm font-medium ${defaultStadiumId === item._id ? "text-accent" : "text-gray-300"}`} numberOfLines={2}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* مربی پیش‌فرض */}
      <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6 mb-6">
        <Text className="text-lg font-semibold text-white mb-3 text-right">مربی پیش‌فرض</Text>
        <Text className="text-gray-400 text-sm mb-4 text-right">به کاربران جدید هنگام ثبت‌نام داده می‌شود.</Text>
        {mentorItems.length === 0 ? (
          <Text className="text-gray-500 py-2 text-right">هیچ آیتم مربی وجود ندارد. از تب فروشگاه یکی بسازید.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {mentorItems.map((item: any) => {
              const imageUrl = item.imageStorageId ? null : item.imagePath?.startsWith("http") ? item.imagePath : null;
              return (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => handleSelectMentor(item._id)}
                  className={`rounded-xl border overflow-hidden ${defaultMentorId === item._id ? "border-accent bg-accent/10" : "border-gray-600 bg-gray-800/50"}`}
                  style={{ width: 120 }}
                >
                  <View className="h-20 bg-gray-700/50 items-center justify-center">
                    {item.imageStorageId ? (
                      <StoreItemImage storageId={item.imageStorageId} />
                    ) : imageUrl ? (
                      <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Ionicons name="school" size={32} color="#6b7280" />
                    )}
                  </View>
                  <Text className={`p-2 text-center text-sm font-medium ${defaultMentorId === item._id ? "text-accent" : "text-gray-300"}`} numberOfLines={2}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* اعمال به همه کاربران */}
      <View className="bg-amber-900/20 rounded-2xl border border-amber-700/30 p-6 mb-6">
        <Text className="text-lg font-semibold text-amber-200 mb-2 text-right">اعمال پیش‌فرض به همه کاربران</Text>
        <Text className="text-gray-400 text-sm mb-4 text-right">
          به کاربرانی که هنوز استادیوم یا مربی ندارند، پیش‌فرض بالا اختصاص داده می‌شود.
        </Text>
        <Button onPress={handleAssignToAllUsers} loading={isAssigningAll} variant="secondary" size="md">
          اعمال به همه کاربران
        </Button>
      </View>
    </ScrollView>
  );
}

function StoreItemImage({ storageId }: { storageId: Id<"_storage"> }) {
  const imageUrl = useQuery(api.categories.getImageUrl, { storageId });
  if (!imageUrl) return <Ionicons name="image-outline" size={32} color="#6b7280" />;
  return <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />;
}
