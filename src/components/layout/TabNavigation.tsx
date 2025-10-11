import { ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";

export interface Tab<T extends string = string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface TabNavigationProps<T extends string> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void | Promise<void>;
  className?: string;
}

/**
 * TabNavigation - Reusable tab navigation component
 * Supports icons, active states, and custom styling
 */
export function TabNavigation<T extends string>({ 
  tabs, 
  activeTab, 
  onTabChange,
  className = "" 
}: TabNavigationProps<T>) {
  return (
    <View className={`items-center mb-8 ${className}`}>
      <View className="bg-background-light/60 rounded-xl border border-gray-700/30 p-1">
        <View className="flex-row gap-1">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              className={`px-6 py-3 rounded-lg flex-row items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-accent"
                  : "bg-transparent active:bg-gray-700/50"
              }`}
              activeOpacity={0.7}
            >
              {tab.icon && <View>{tab.icon}</View>}
              <Text className={`font-semibold ${
                activeTab === tab.id ? "text-white" : "text-gray-400"
              }`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

