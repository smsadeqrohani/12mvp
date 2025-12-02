import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch } from "react-native";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "../../../lib/toast";
import { Button } from "../../../components/ui";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "../../../../convex/_generated/dataModel";

interface StoreItemFormProps {
  item?: {
    _id: Id<"storeItems">;
    name: string;
    description?: string;
    price: number;
    itemType: "stadium" | "mentor";
    matchesBonus?: number;
    tournamentsBonus?: number;
    mentorMode?: 1 | 2;
    durationMs: number;
    isActive: boolean;
  };
  defaultItemType?: "stadium" | "mentor";
  onClose: () => void;
}

export function StoreItemForm({ item, defaultItemType, onClose }: StoreItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price?.toString() || "0",
    itemType: item?.itemType || defaultItemType || "stadium" as "stadium" | "mentor",
    matchesBonus: item?.matchesBonus?.toString() || "0",
    tournamentsBonus: item?.tournamentsBonus?.toString() || "0",
    mentorMode: item?.mentorMode?.toString() || "1",
    durationMs: item?.durationMs?.toString() || (30 * 24 * 60 * 60 * 1000).toString(), // 30 days default
    isActive: item?.isActive ?? true,
  });

  const createStoreItem = useMutation(api.store.createStoreItem);
  const updateStoreItem = useMutation(api.store.updateStoreItem);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("نام آیتم الزامی است");
      return;
    }
    if (parseFloat(formData.price) <= 0) {
      toast.error("قیمت باید بیشتر از صفر باشد");
      return;
    }
    if (formData.itemType === "stadium") {
      if (parseFloat(formData.matchesBonus) < 0) {
        toast.error("تعداد بازی نمی‌تواند منفی باشد");
        return;
      }
      if (parseFloat(formData.tournamentsBonus) < 0) {
        toast.error("تعداد تورنومنت نمی‌تواند منفی باشد");
        return;
      }
    } else if (formData.itemType === "mentor") {
      if (formData.mentorMode !== "1" && formData.mentorMode !== "2") {
        toast.error("مدل منتور باید 1 یا 2 باشد");
        return;
      }
    }
    if (parseFloat(formData.durationMs) < 0) {
      toast.error("مدت زمان نمی‌تواند منفی باشد");
      return;
    }
    // 0 is allowed (permanent, never expires)

    setIsSubmitting(true);
    try {
      const baseData: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        itemType: formData.itemType,
        durationMs: parseFloat(formData.durationMs),
        isActive: formData.isActive,
      };
      
      if (formData.itemType === "stadium") {
        baseData.matchesBonus = parseInt(formData.matchesBonus);
        baseData.tournamentsBonus = parseInt(formData.tournamentsBonus);
      } else if (formData.itemType === "mentor") {
        baseData.mentorMode = parseInt(formData.mentorMode) as 1 | 2;
      }
      
      // Check if item exists and has a valid ID (not empty string)
      if (item && item._id && item._id !== "" && item._id !== "undefined") {
        await updateStoreItem({
          itemId: item._id,
          ...baseData,
        });
        toast.success("آیتم با موفقیت به‌روزرسانی شد");
      } else {
        await createStoreItem(baseData);
        toast.success("آیتم جدید با موفقیت ایجاد شد");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "خطا در ذخیره آیتم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDurationDays = () => {
    const ms = parseFloat(formData.durationMs) || 0;
    return Math.floor(ms / (24 * 60 * 60 * 1000));
  };

  const setDurationDays = (days: number) => {
    const ms = days * 24 * 60 * 60 * 1000;
    setFormData({ ...formData, durationMs: ms.toString() });
  };

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <View className="p-4 space-y-4">
        <View>
          <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
            نام آیتم *
          </Text>
          <TextInput
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white"
            placeholder="مثال: استادیوم"
            placeholderTextColor="#6b7280"
            textAlign="right"
            editable={!isSubmitting}
          />
        </View>

        <View>
          <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
            توضیحات
          </Text>
          <TextInput
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white"
            placeholder="توضیحات کامل آیتم"
            placeholderTextColor="#6b7280"
            textAlign="right"
            multiline
            numberOfLines={3}
            editable={!isSubmitting}
          />
        </View>

        <View>
          <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
            نوع آیتم *
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setFormData({ ...formData, itemType: "stadium" })}
              className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                formData.itemType === "stadium"
                  ? "bg-accent/20 border-accent"
                  : "bg-gray-800/80 border-gray-700/60"
              }`}
              disabled={isSubmitting}
            >
              <Text className={`text-center font-semibold ${
                formData.itemType === "stadium" ? "text-accent" : "text-gray-400"
              }`} style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                استادیوم
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFormData({ ...formData, itemType: "mentor" })}
              className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                formData.itemType === "mentor"
                  ? "bg-accent/20 border-accent"
                  : "bg-gray-800/80 border-gray-700/60"
              }`}
              disabled={isSubmitting}
            >
              <Text className={`text-center font-semibold ${
                formData.itemType === "mentor" ? "text-accent" : "text-gray-400"
              }`} style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                منتور
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
            قیمت (امتیاز) *
          </Text>
          <TextInput
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text.replace(/[^0-9]/g, "") })}
            className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white"
            placeholder="0"
            placeholderTextColor="#6b7280"
            textAlign="right"
            keyboardType="numeric"
            editable={!isSubmitting}
          />
        </View>

        {formData.itemType === "stadium" && (
          <>
            <View>
              <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                تعداد بازی اضافی
              </Text>
              <TextInput
                value={formData.matchesBonus}
                onChangeText={(text) => setFormData({ ...formData, matchesBonus: text.replace(/[^0-9]/g, "") })}
                className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white"
                placeholder="0"
                placeholderTextColor="#6b7280"
                textAlign="right"
                keyboardType="numeric"
                editable={!isSubmitting}
              />
            </View>

            <View>
              <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                تعداد تورنومنت اضافی
              </Text>
              <TextInput
                value={formData.tournamentsBonus}
                onChangeText={(text) => setFormData({ ...formData, tournamentsBonus: text.replace(/[^0-9]/g, "") })}
                className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white"
                placeholder="0"
                placeholderTextColor="#6b7280"
                textAlign="right"
                keyboardType="numeric"
                editable={!isSubmitting}
              />
            </View>
          </>
        )}

        {formData.itemType === "mentor" && (
          <View>
            <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
              مدل منتور *
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, mentorMode: "1" })}
                className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                  formData.mentorMode === "1"
                    ? "bg-accent/20 border-accent"
                    : "bg-gray-800/80 border-gray-700/60"
                }`}
                disabled={isSubmitting}
              >
                <Text className={`text-center font-semibold ${
                  formData.mentorMode === "1" ? "text-accent" : "text-gray-400"
                }`} style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                  حذف ۱ گزینه
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, mentorMode: "2" })}
                className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                  formData.mentorMode === "2"
                    ? "bg-accent/20 border-accent"
                    : "bg-gray-800/80 border-gray-700/60"
                }`}
                disabled={isSubmitting}
              >
                <Text className={`text-center font-semibold ${
                  formData.mentorMode === "2" ? "text-accent" : "text-gray-400"
                }`} style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                  حذف ۲ گزینه
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View>
          <Text className="text-white mb-2 text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
            مدت اعتبار (روز)
          </Text>
          <View className="flex-row items-center gap-2">
            <TextInput
              value={calculateDurationDays().toString()}
              onChangeText={(text) => {
                const days = parseInt(text.replace(/[^0-9]/g, "")) || 0;
                setDurationDays(days);
              }}
              className="flex-1 bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 text-white"
              placeholder="30 (0 برای دائمی)"
              placeholderTextColor="#6b7280"
              textAlign="right"
              keyboardType="numeric"
              editable={!isSubmitting}
            />
            <Text className="text-gray-400" style={{ fontFamily: 'Vazirmatn-Regular' }}>
              روز
            </Text>
          </View>
          <Text className="text-gray-400 text-xs mt-1 text-right" style={{ fontFamily: 'Vazirmatn-Regular' }}>
            {calculateDurationDays() === 0 ? "0 = فعال دائمی (هرگز expire نمی‌شود)" : ""}
          </Text>
        </View>

        <View className="flex-row items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <Text className="text-white" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
            فعال
          </Text>
          <Switch
            value={formData.isActive}
            onValueChange={(value) => setFormData({ ...formData, isActive: value })}
            disabled={isSubmitting}
            trackColor={{ false: "#374151", true: "#ff701a" }}
            thumbColor={formData.isActive ? "#fff" : "#9ca3af"}
          />
        </View>

        <View className="flex-row gap-3 mt-6">
          <TouchableOpacity
            onPress={onClose}
            disabled={isSubmitting}
            className="flex-1 p-4 bg-gray-700 rounded-lg"
          >
            <Text className="text-white text-center font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
              انصراف
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 p-4 bg-accent rounded-lg"
          >
            <Text className="text-white text-center font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
              {isSubmitting ? "در حال ذخیره..." : item ? "به‌روزرسانی" : "ذخیره"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

