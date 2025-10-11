import { Platform, View, Text } from "react-native";
import Toast from "react-native-toast-message";

// Cross-platform toast implementation
export const toast = {
  success: (message: string) => {
    if (Platform.OS === 'web') {
      // Use browser alert for web as fallback
      console.log('✅ Success:', message);
      alert(message);
    } else {
      Toast.show({
        type: "success",
        text1: message,
        position: "top",
        visibilityTime: 4000,
      });
    }
  },
  error: (message: string) => {
    if (Platform.OS === 'web') {
      // Use browser alert for web as fallback
      console.error('❌ Error:', message);
      alert(message);
    } else {
      Toast.show({
        type: "error",
        text1: message,
        position: "top",
        visibilityTime: 4000,
      });
    }
  },
  info: (message: string) => {
    if (Platform.OS === 'web') {
      console.info('ℹ️ Info:', message);
      alert(message);
    } else {
      Toast.show({
        type: "info",
        text1: message,
        position: "top",
        visibilityTime: 4000,
      });
    }
  },
  warning: (message: string) => {
    if (Platform.OS === 'web') {
      console.warn('⚠️ Warning:', message);
      alert(message);
    } else {
      Toast.show({
        type: "warning",
        text1: message,
        position: "top",
        visibilityTime: 4000,
      });
    }
  },
};

// Toast config using React Native components
export const toastConfig = {
  success: (props: any) => (
    <View style={{
      backgroundColor: '#0a2840',
      borderColor: '#10b981',
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
      marginHorizontal: 16
    }}>
      <Text style={{
        color: '#e5e7eb',
        fontWeight: '600',
        textAlign: 'center'
      }}>{props.text1}</Text>
    </View>
  ),
  error: (props: any) => (
    <View style={{
      backgroundColor: '#0a2840',
      borderColor: '#ef4444',
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
      marginHorizontal: 16
    }}>
      <Text style={{
        color: '#e5e7eb',
        fontWeight: '600',
        textAlign: 'center'
      }}>{props.text1}</Text>
    </View>
  ),
  info: (props: any) => (
    <View style={{
      backgroundColor: '#0a2840',
      borderColor: '#3b82f6',
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
      marginHorizontal: 16
    }}>
      <Text style={{
        color: '#e5e7eb',
        fontWeight: '600',
        textAlign: 'center'
      }}>{props.text1}</Text>
    </View>
  ),
  warning: (props: any) => (
    <View style={{
      backgroundColor: '#0a2840',
      borderColor: '#f59e0b',
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
      marginHorizontal: 16
    }}>
      <Text style={{
        color: '#e5e7eb',
        fontWeight: '600',
        textAlign: 'center'
      }}>{props.text1}</Text>
    </View>
  ),
};

