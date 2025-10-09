import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-700/50 rounded",
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-lg p-4">
        <Skeleton className="h-4 w-full" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-background-light/40 rounded-lg p-4">
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-12 w-full" />
      </div>
      <Skeleton className="h-12 w-full mt-6" />
    </div>
  );
}

