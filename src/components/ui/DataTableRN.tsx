import { ReactNode } from "react";
import { View, Text, ScrollView, FlatList } from "react-native";
import { useResponsive } from "../../hooks";

/**
 * Column definition for DataTable
 */
export interface Column<T> {
  key: string;
  header: string;
  width?: number | string; // width in pixels or 'flex-1' style
  icon?: ReactNode;
  render: (item: T, index: number) => ReactNode;
}

/**
 * DataTable props
 */
export interface DataTableRNProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyState?: {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
  };
}

/**
 * Cross-platform DataTable component for React Native
 * 
 * - Desktop/Web with mouse: Traditional table with horizontal scroll
 * - Touch devices (iPad/Mobile): Optimized card layout with FlatList virtualization
 * 
 * Automatically adapts based on platform and screen size
 */
export function DataTableRN<T>({ 
  columns, 
  data, 
  keyExtractor, 
  emptyState 
}: DataTableRNProps<T>) {
  const responsive = useResponsive();
  const { shouldUseTableLayout, shouldUseCardLayout, touchTargetSize } = responsive || {
    shouldUseTableLayout: false,
    shouldUseCardLayout: true,
    touchTargetSize: 44
  };
  
  // Show empty state if no data
  if (data.length === 0 && emptyState) {
    return (
      <View className="items-center py-16">
        {emptyState.icon && (
          <View className="w-16 h-16 bg-gray-700/50 rounded-full items-center justify-center mb-4">
            {emptyState.icon}
          </View>
        )}
        <Text className="text-gray-400 text-lg" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
          {emptyState.title}
        </Text>
        <Text className="text-gray-500 text-sm mt-1" style={{ fontFamily: 'Vazirmatn-Regular' }}>
          {emptyState.description}
        </Text>
        {emptyState.action && (
          <View className="mt-4">{emptyState.action}</View>
        )}
      </View>
    );
  }

  // Touch devices: Use FlatList with card layout for better performance
  if (shouldUseCardLayout) {
    return (
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => (
          <View 
            className="bg-background-light/60 backdrop-blur-sm rounded-xl border border-gray-700/30 p-4 mb-3"
            style={{ minHeight: touchTargetSize }}
          >
            {columns.map((column) => {
              const renderedContent = column.render(item, index);
              return (
                <View key={column.key} className="mb-3 last:mb-0">
                  {/* Column header */}
                  <View className="flex-row items-center gap-2 mb-1">
                    {column.icon}
                    <Text className="text-gray-400 text-xs font-semibold uppercase" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                      {column.header}
                    </Text>
                  </View>
                  {/* Column content */}
                  <View>
                    {typeof renderedContent === 'string' || typeof renderedContent === 'number' ? (
                      <Text className="text-white" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                        {String(renderedContent)}
                      </Text>
                    ) : (
                      renderedContent
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        // Better scroll performance
        decelerationRate="normal"
      />
    );
  }

  // Desktop/Web with mouse: Traditional table layout
  return (
    <View className="bg-gradient-to-br from-background-light/80 to-background-light/40 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden shadow-2xl shadow-black/20">
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View className="min-w-full">
          {/* Table Header */}
          <View className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-b border-gray-600/50 flex-row">
            {columns.map((column) => (
              <View 
                key={column.key}
                className="px-6 py-4"
                style={column.width ? { width: column.width } : { flex: 1 }}
              >
                <View className="flex-row items-center gap-2">
                  {column.icon}
                  <Text className="text-gray-300 font-semibold text-sm uppercase tracking-wider text-right">
                    {column.header}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          
          {/* Table Body */}
          <View>
            {data.map((item, index) => (
              <View
                key={keyExtractor(item)}
                className={`border-b border-gray-700/30 ${
                  index % 2 === 0 ? "bg-gray-800/10" : "bg-gray-800/5"
                }`}
              >
                <View className="flex-row items-center min-h-[80px]">
                  {columns.map((column) => (
                    <View 
                      key={column.key}
                      className="px-6 py-4"
                      style={column.width ? { width: column.width } : { flex: 1 }}
                    >
                      {column.render(item, index)}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

