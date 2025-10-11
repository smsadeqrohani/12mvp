import { View, Text } from "react-native";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  className?: string;
}

/**
 * PageHeader - Consistent page header component
 * Used for displaying page titles with optional subtitle and icon
 */
export function PageHeader({ 
  title, 
  subtitle, 
  icon = "👋",
  className = "" 
}: PageHeaderProps) {
  return (
    <View className={`items-center mb-8 ${className}`}>
      <Text className="text-4xl font-bold text-accent mb-2">
        {title} {icon}
      </Text>
      {subtitle && (
        <Text className="text-lg text-gray-300">
          {subtitle}
        </Text>
      )}
    </View>
  );
}

