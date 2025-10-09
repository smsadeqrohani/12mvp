import { LoadingSpinner } from "./LoadingSpinner";

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "در حال بارگذاری..." }: PageLoaderProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
      <LoadingSpinner />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

