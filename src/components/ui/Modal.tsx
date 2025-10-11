import { ReactNode } from "react";
import { Modal as RNModal, View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const { width } = Dimensions.get("window");

const sizeWidths = {
  sm: Math.min(width - 32, 400),
  md: Math.min(width - 32, 600),
  lg: Math.min(width - 32, 800),
  xl: Math.min(width - 32, 1000),
  full: width - 32,
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View
          className="bg-background-light rounded-2xl border border-gray-700/30"
          style={{ width: sizeWidths[size], maxHeight: "90%" }}
        >
          <ScrollView className="p-6">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center gap-3 flex-1">
                {icon && (
                  <View className="w-10 h-10 bg-accent/20 rounded-lg items-center justify-center">
                    {icon}
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-white">{title}</Text>
                  {description && <Text className="text-gray-400 text-sm">{description}</Text>}
                </View>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 bg-gray-700/50 active:bg-gray-600 rounded-lg items-center justify-center ml-2"
              >
                <Ionicons name="close" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

