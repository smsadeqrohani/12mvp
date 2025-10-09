interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`animate-spin rounded-full border-b-2 border-accent ${sizeClasses[size]} ${className}`} />
  );
}

interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text = "در حال بارگذاری..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
      {text && <p className="text-gray-400 mt-4">{text}</p>}
    </div>
  );
}

