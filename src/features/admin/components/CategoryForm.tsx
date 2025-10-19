import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, Platform } from "react-native";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "../../../lib/toast";
import { Button, TextInput } from "../../../components/ui";
import { Ionicons } from "@expo/vector-icons";

interface CategoryFormProps {
  category?: any;
  onClose: () => void;
}

export function CategoryForm({ category, onClose }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    persianName: category?.persianName || "",
    slug: category?.slug || "",
    englishName: category?.englishName || "",
  });

  const createCategory = useMutation(api.categories.createCategory);
  const updateCategory = useMutation(api.categories.updateCategory);


  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      if (category) {
        await updateCategory({
          categoryId: category._id,
          persianName: formData.persianName,
          slug: formData.slug,
          englishName: formData.englishName || undefined,
        });
        toast.success("دسته‌بندی با موفقیت به‌روزرسانی شد");
      } else {
        await createCategory({
          persianName: formData.persianName,
          slug: formData.slug,
          englishName: formData.englishName || undefined,
        });
        toast.success("دسته‌بندی جدید با موفقیت ایجاد شد");
      }
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("خطا در ذخیره دسته‌بندی: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // On web, render without Modal to avoid input issues
  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-accent/20 rounded-lg items-center justify-center">
              <Ionicons name="folder-outline" size={24} color="#ff701a" />
            </View>
            <View>
              <Text className="text-xl font-bold text-white text-right">
                {category ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
              </Text>
              <Text className="text-gray-400 text-sm text-right">
                {category ? "اطلاعات دسته‌بندی را ویرایش کنید" : "اطلاعات دسته‌بندی جدید را وارد کنید"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 bg-gray-700/50 rounded-lg items-center justify-center"
          >
            <Ionicons name="close" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Persian Name */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              نام فارسی *
            </Text>
            <TextInput
              value={formData.persianName}
              onChangeText={(value) => handleInputChange("persianName", value)}
              placeholder="نام فارسی دسته‌بندی را وارد کنید..."
              textAlign="right"
            />
          </View>

          {/* Slug */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              Slug *
            </Text>
            <TextInput
              value={formData.slug}
              onChangeText={(value) => handleInputChange("slug", value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="category-slug"
              textAlign="left"
              autoCapitalize="none"
              style={{
                fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
              }}
            />
            <Text className="text-gray-500 text-xs mt-1 text-right">
              فقط حروف کوچک انگلیسی، اعداد و خط تیره (-)
            </Text>
          </View>

          {/* English Name */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              نام انگلیسی (اختیاری)
            </Text>
            <TextInput
              value={formData.englishName}
              onChangeText={(value) => handleInputChange("englishName", value)}
              placeholder="English Name (optional)"
              textAlign="left"
            />
          </View>

          {/* Submit Button */}
          <View className="mt-8 mb-4">
            <Button
              onPress={handleSubmit}
              loading={isSubmitting}
              variant="primary"
              size="lg"
              disabled={!formData.persianName || !formData.slug}
            >
              {category ? "به‌روزرسانی دسته‌بندی" : "ایجاد دسته‌بندی"}
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle={Platform.OS === 'web' ? 'fullScreen' : 'pageSheet'}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-accent/20 rounded-lg items-center justify-center">
              <Ionicons name="folder-outline" size={24} color="#ff701a" />
            </View>
            <View>
              <Text className="text-xl font-bold text-white text-right">
                {category ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
              </Text>
              <Text className="text-gray-400 text-sm text-right">
                {category ? "اطلاعات دسته‌بندی را ویرایش کنید" : "اطلاعات دسته‌بندی جدید را وارد کنید"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 bg-gray-700/50 rounded-lg items-center justify-center"
          >
            <Ionicons name="close" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Persian Name */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              نام فارسی *
            </Text>
            <TextInput
              value={formData.persianName}
              onChangeText={(value) => handleInputChange("persianName", value)}
              placeholder="نام فارسی دسته‌بندی را وارد کنید..."
              textAlign="right"
            />
          </View>

          {/* Slug */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              Slug *
            </Text>
            <TextInput
              value={formData.slug}
              onChangeText={(value) => handleInputChange("slug", value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="category-slug"
              textAlign="left"
              autoCapitalize="none"
              style={{
                fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
              }}
            />
            <Text className="text-gray-500 text-xs mt-1 text-right">
              فقط حروف کوچک انگلیسی، اعداد و خط تیره (-)
            </Text>
          </View>

          {/* English Name */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-300 mb-2 text-right">
              نام انگلیسی (اختیاری)
            </Text>
            <TextInput
              value={formData.englishName}
              onChangeText={(value) => handleInputChange("englishName", value)}
              placeholder="English Name (optional)"
              textAlign="left"
            />
          </View>

          {/* Submit Button */}
          <View className="mt-8 mb-4">
            <Button
              onPress={handleSubmit}
              loading={isSubmitting}
              variant="primary"
              size="lg"
              disabled={!formData.persianName || !formData.slug}
            >
              {category ? "به‌روزرسانی دسته‌بندی" : "ایجاد دسته‌بندی"}
            </Button>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

