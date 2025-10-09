import { ReactNode } from "react";

export interface Tab<T extends string = string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface TabNavigationProps<T extends string> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
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
    <div className={`flex justify-center mb-8 ${className}`}>
      <div className="bg-background-light/60 backdrop-blur-sm rounded-xl border border-gray-700/30 p-1">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-accent text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

