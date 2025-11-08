import { ReactNode } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../ui";

interface PlayerCardProps {
  name: string;
  score?: number;
  time?: number;
  isWinner?: boolean;
  isCurrentUser?: boolean;
  status?: ReactNode;
  className?: string;
  avatarId?: string | null;
}

export function PlayerCard({
  name,
  score,
  time,
  isWinner,
  isCurrentUser,
  status,
  className = "",
  avatarId,
}: PlayerCardProps) {
  return (
    <View
      className={`bg-background-light/60 rounded-xl border ${
        isWinner
          ? "border-accent/50"
          : "border-gray-700/30"
      } p-6 ${className}`}
    >
      <View className="flex-row items-center gap-4 mb-4">
        <Avatar
          avatarId={avatarId}
          size="md"
          highlighted={isWinner}
        />
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-white font-semibold text-lg">
              {name}
            </Text>
            {isCurrentUser && (
              <Text className="text-xs text-gray-400 font-normal">(شما)</Text>
            )}
          </View>
          {status && <View className="mt-1">{status}</View>}
        </View>
        {isWinner && (
          <View className="w-8 h-8 bg-accent rounded-full items-center justify-center">
            <Ionicons name="checkmark" size={20} color="#fff" />
          </View>
        )}
      </View>

      {(score !== undefined || time !== undefined) && (
        <View className="flex-row gap-4 pt-4 border-t border-gray-700/30">
          {score !== undefined && (
            <View className="flex-1">
              <Text className="text-gray-400 text-sm mb-1">امتیاز</Text>
              <Text className="text-white text-2xl font-bold">{score}</Text>
            </View>
          )}
          {time !== undefined && (
            <View className="flex-1">
              <Text className="text-gray-400 text-sm mb-1">زمان</Text>
              <Text className="text-white text-2xl font-bold">{time}s</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

