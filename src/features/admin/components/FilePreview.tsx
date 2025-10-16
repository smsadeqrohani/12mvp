import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../../components/ui";
import { Ionicons } from "@expo/vector-icons";

interface FilePreviewProps {
  file: {
    _id: string;
    fileName: string;
    fileType: string;
    storageId: string;
  };
  onClose: () => void;
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const fileUrl = useQuery(api.questions.getMediaUrl, { storageId: file.storageId });

  const handleOpenInBrowser = async () => {
    if (fileUrl) {
      try {
        await Linking.openURL(fileUrl);
      } catch (error) {
        console.error("Error opening URL:", error);
      }
    }
  };

  const renderFileContent = () => {
    if (!fileUrl) {
      return (
        <View className="flex-1 items-center justify-center p-8">
          <ActivityIndicator size="large" color="#ff701a" />
          <Text className="text-gray-400 mt-4">در حال بارگذاری...</Text>
        </View>
      );
    }

    if (file.fileType.startsWith("image/")) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-400 text-center mb-4">
            پیش‌نمایش تصویر در نسخه موبایل در دسترس نیست
          </Text>
          <Button onPress={handleOpenInBrowser} variant="primary">
            باز کردن در مرورگر
          </Button>
        </View>
      );
    } else if (file.fileType.startsWith("video/")) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-400 text-center mb-4">
            پیش‌نمایش ویدیو در نسخه موبایل در دسترس نیست
          </Text>
          <Button onPress={handleOpenInBrowser} variant="primary">
            باز کردن در مرورگر
          </Button>
        </View>
      );
    } else if (file.fileType.startsWith("audio/")) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-400 text-center mb-4">
            پیش‌نمایش صدا در نسخه موبایل در دسترس نیست
          </Text>
          <Button onPress={handleOpenInBrowser} variant="primary">
            باز کردن در مرورگر
          </Button>
        </View>
      );
    } else if (file.fileType.includes("pdf")) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-400 text-center mb-4">
            پیش‌نمایش PDF در نسخه موبایل در دسترس نیست
          </Text>
          <Button onPress={handleOpenInBrowser} variant="primary">
            باز کردن در مرورگر
          </Button>
        </View>
      );
    } else {
      return (
        <View className="flex-1 items-center justify-center p-8">
          <View className="w-16 h-16 bg-gray-700/50 rounded-full items-center justify-center mb-4">
            <Ionicons name="document-outline" size={32} color="#6b7280" />
          </View>
          <Text className="text-gray-400 text-lg mb-4 text-center">
            پیش‌نمایش برای این نوع فایل پشتیبانی نمی‌شود
          </Text>
          <Button onPress={handleOpenInBrowser} variant="primary">
            باز کردن در مرورگر
          </Button>
        </View>
      );
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
          <View className="flex-1">
            <Text className="text-xl font-bold text-white text-right" numberOfLines={1}>
              {file.fileName}
            </Text>
            <Text className="text-gray-400 text-sm text-right">
              {file.fileType}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 bg-gray-700/50 rounded-lg items-center justify-center"
          >
            <Ionicons name="close" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
        
        {/* Content */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {renderFileContent()}
        </ScrollView>
      </View>
    </Modal>
  );
}