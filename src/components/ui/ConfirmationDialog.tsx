import { View, Text, TouchableOpacity } from "react-native";
import { Modal } from "./Modal";
import { Ionicons } from "@expo/vector-icons";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "تأیید",
  cancelText = "لغو",
  variant = "danger",
}: ConfirmationDialogProps) {
  const variantStyles = {
    danger: {
      button: "bg-red-600/20 border border-red-500/30",
      text: "text-red-400",
      icon: "alert-circle" as const,
      iconColor: "#ef4444",
    },
    warning: {
      button: "bg-yellow-600/20 border border-yellow-500/30",
      text: "text-yellow-400",
      icon: "warning" as const,
      iconColor: "#f59e0b",
    },
    info: {
      button: "bg-blue-600/20 border border-blue-500/30",
      text: "text-blue-400",
      icon: "information-circle" as const,
      iconColor: "#3b82f6",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      icon={
        <Ionicons name={styles.icon} size={24} color={styles.iconColor} />
      }
    >
      <View className="gap-6">
        <Text className="text-gray-300 text-right" style={{ fontFamily: 'Vazirmatn-Regular' }}>
          {message}
        </Text>
        
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 py-3 px-4 bg-gray-700/50 border border-gray-600 rounded-lg"
            activeOpacity={0.7}
          >
            <Text className="text-gray-300 text-center font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
              {cancelText}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 px-4 ${styles.button} rounded-lg`}
            activeOpacity={0.7}
          >
            <Text className={`${styles.text} text-center font-semibold`} style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


