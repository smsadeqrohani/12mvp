import { ReactNode } from "react";

interface PlayerCardProps {
  name: string;
  score?: number;
  time?: number;
  isWinner?: boolean;
  isCurrentUser?: boolean;
  status?: ReactNode;
  className?: string;
}

export function PlayerCard({
  name,
  score,
  time,
  isWinner,
  isCurrentUser,
  status,
  className = "",
}: PlayerCardProps) {
  return (
    <div
      className={`bg-background-light/60 backdrop-blur-sm rounded-xl border ${
        isWinner
          ? "border-accent/50 shadow-lg shadow-accent/20"
          : "border-gray-700/30"
      } p-6 ${className}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isWinner
              ? "bg-gradient-to-br from-accent to-accent-hover"
              : "bg-gradient-to-br from-accent/20 to-accent/10"
          }`}
        >
          <span
            className={`font-bold text-lg ${
              isWinner ? "text-white" : "text-accent"
            }`}
          >
            {name[0]}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            {name}
            {isCurrentUser && (
              <span className="text-xs text-gray-400 font-normal">(شما)</span>
            )}
          </h3>
          {status && <div className="mt-1">{status}</div>}
        </div>
        {isWinner && (
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>

      {(score !== undefined || time !== undefined) && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/30">
          {score !== undefined && (
            <div>
              <p className="text-gray-400 text-sm mb-1">امتیاز</p>
              <p className="text-white text-2xl font-bold">{score}</p>
            </div>
          )}
          {time !== undefined && (
            <div>
              <p className="text-gray-400 text-sm mb-1">زمان</p>
              <p className="text-white text-2xl font-bold">{time}s</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

