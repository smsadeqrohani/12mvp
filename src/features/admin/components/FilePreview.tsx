import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Image, Dimensions } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../../components/ui";
import { Ionicons } from "@expo/vector-icons";
import { IS_WEB, IS_IOS } from "../../../lib/platform";

interface FilePreviewProps {
  file: {
    _id: string;
    originalName: string;
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

    // Check if we can show previews (web or iPad)
    const canShowPreview = IS_WEB || (IS_IOS && Dimensions.get('window').width >= 768);

    if (file.fileType.startsWith("image/")) {
      if (canShowPreview) {
        const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
        const maxWidth = Math.min(screenWidth - 40, 800);
        const maxHeight = Math.min(screenHeight - 200, 600);
        
        return (
          <View className="flex-1 items-center justify-center p-4">
            <View className="bg-gray-800/50 rounded-lg p-4">
              <Image
                source={{ uri: fileUrl }}
                style={{
                  width: maxWidth,
                  height: maxHeight,
                  maxWidth: maxWidth,
                  maxHeight: maxHeight,
                }}
                resizeMode="contain"
                onError={() => {
                  console.error("Error loading image:", fileUrl);
                }}
              />
            </View>
            <View className="mt-4 flex-row gap-3">
              <Button onPress={handleOpenInBrowser} variant="secondary" size="sm">
                باز کردن در مرورگر
              </Button>
            </View>
          </View>
        );
      } else {
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
      }
    } else if (file.fileType.startsWith("video/")) {
      if (canShowPreview) {
        return (
          <View className="flex-1 items-center justify-center p-4">
            <View className="bg-gray-800/50 rounded-lg p-4 w-full max-w-2xl">
              <video
                controls
                style={{
                  width: '100%',
                  maxHeight: '500px',
                  borderRadius: '8px',
                }}
                src={fileUrl}
              >
                مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند
              </video>
            </View>
            <View className="mt-4 flex-row gap-3">
              <Button onPress={handleOpenInBrowser} variant="secondary" size="sm">
                باز کردن در مرورگر
              </Button>
            </View>
          </View>
        );
      } else {
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
      }
    } else if (file.fileType.startsWith("audio/")) {
      if (canShowPreview) {
        return (
          <View className="flex-1 items-center justify-center p-4">
            <View className="bg-gray-800/50 rounded-lg p-6 w-full max-w-md">
              <View className="flex-row items-center justify-center mb-4">
                <Ionicons name="musical-notes" size={48} color="#ff701a" />
              </View>
              <audio
                controls
                style={{
                  width: '100%',
                }}
                src={fileUrl}
              >
                مرورگر شما از پخش صدا پشتیبانی نمی‌کند
              </audio>
            </View>
            <View className="mt-4 flex-row gap-3">
              <Button onPress={handleOpenInBrowser} variant="secondary" size="sm">
                باز کردن در مرورگر
              </Button>
            </View>
          </View>
        );
      } else {
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
      }
    } else if (file.fileType.includes("pdf")) {
      if (canShowPreview) {
        return (
          <View className="flex-1 items-center justify-center p-4">
            <View className="bg-gray-800/50 rounded-lg p-4 w-full max-w-4xl h-full max-h-96">
              <iframe
                src={fileUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px',
                }}
                title={file.originalName}
              />
            </View>
            <View className="mt-4 flex-row gap-3">
              <Button onPress={handleOpenInBrowser} variant="secondary" size="sm">
                باز کردن در مرورگر
              </Button>
            </View>
          </View>
        );
      } else {
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
      }
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
      presentationStyle={IS_WEB ? "fullScreen" : (IS_IOS && Dimensions.get('window').width >= 768 ? "formSheet" : "pageSheet")}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
          <View className="flex-1">
            <Text className="text-xl font-bold text-white text-right" numberOfLines={1}>
              {file.originalName}
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