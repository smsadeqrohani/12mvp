import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

export interface StatsDonutCardProps {
  goalsScored: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
}

const DONUT_SIZE = 80;
const STROKE = 10;
const R = (DONUT_SIZE - STROKE) / 2;
const CX = DONUT_SIZE / 2;
const CY = DONUT_SIZE / 2;
const GREEN = "#22c55e";
const BLUE = "#3b82f6";
const RED = "#ef4444";

function DonutChart({ wins, draws, losses }: { wins: number; draws: number; losses: number }) {
  const total = wins + draws + losses;
  if (total === 0) {
    return (
      <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
        <Circle
          cx={CX}
          cy={CY}
          r={R}
          stroke="#374151"
          strokeWidth={STROKE}
          fill="transparent"
        />
      </Svg>
    );
  }
  const winFrac = wins / total;
  const drawFrac = draws / total;
  const lossFrac = losses / total;
  const circumference = 2 * Math.PI * R;
  const winLen = circumference * winFrac;
  const drawLen = circumference * drawFrac;
  const lossLen = circumference * lossFrac;
  const winOffset = 0;
  const drawOffset = winLen;
  const lossOffset = winLen + drawLen;

  return (
    <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
      <Circle
        cx={CX}
        cy={CY}
        r={R}
        stroke={GREEN}
        strokeWidth={STROKE}
        fill="transparent"
        strokeDasharray={`${winLen} ${circumference}`}
        strokeDashoffset={0}
        transform={`rotate(-90 ${CX} ${CY})`}
      />
      <Circle
        cx={CX}
        cy={CY}
        r={R}
        stroke={BLUE}
        strokeWidth={STROKE}
        fill="transparent"
        strokeDasharray={`${drawLen} ${circumference}`}
        strokeDashoffset={-winLen}
        transform={`rotate(-90 ${CX} ${CY})`}
      />
      <Circle
        cx={CX}
        cy={CY}
        r={R}
        stroke={RED}
        strokeWidth={STROKE}
        fill="transparent"
        strokeDasharray={`${lossLen} ${circumference}`}
        strokeDashoffset={-(winLen + drawLen)}
        transform={`rotate(-90 ${CX} ${CY})`}
      />
    </Svg>
  );
}

export function StatsDonutCard({
  goalsScored,
  gamesPlayed,
  wins,
  draws,
  losses,
}: StatsDonutCardProps) {
  return (
    <View className="bg-background-light rounded-2xl border border-gray-700/30 p-4">
      {/* Top row: تعداد بازی (right in RTL), گل رخت (left in RTL) */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="items-end">
          <Text className="text-gray-400 text-sm" style={{ fontFamily: "Meem-Regular" }}>
            گل رخت
          </Text>
          <Text className="text-white text-2xl font-bold" style={{ fontFamily: "Meem-Bold" }}>
            {goalsScored.toLocaleString("fa-IR")}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-gray-400 text-sm" style={{ fontFamily: "Meem-Regular" }}>
            تعداد بازی
          </Text>
          <Text className="text-white text-2xl font-bold" style={{ fontFamily: "Meem-Bold" }}>
            {gamesPlayed.toLocaleString("fa-IR")}
          </Text>
        </View>
      </View>
      {/* Bottom row: donut (right in RTL), breakdown list (left in RTL) */}
      <View className="flex-row items-center gap-4">
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-green-500" />
            <Text className="text-gray-300" style={{ fontFamily: "Meem-Regular" }}>
              برد
            </Text>
            <Text className="text-white font-bold" style={{ fontFamily: "Meem-Bold" }}>
              {wins.toLocaleString("fa-IR")}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-blue-500" />
            <Text className="text-gray-300" style={{ fontFamily: "Meem-Regular" }}>
              مساوی
            </Text>
            <Text className="text-white font-bold" style={{ fontFamily: "Meem-Bold" }}>
              {draws.toLocaleString("fa-IR")}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-red-500" />
            <Text className="text-gray-300" style={{ fontFamily: "Meem-Regular" }}>
              باخت
            </Text>
            <Text className="text-white font-bold" style={{ fontFamily: "Meem-Bold" }}>
              {losses.toLocaleString("fa-IR")}
            </Text>
          </View>
        </View>
        <DonutChart wins={wins} draws={draws} losses={losses} />
      </View>
    </View>
  );
}
