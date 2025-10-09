import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-full mx-4",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`bg-gradient-to-br from-background-light/95 to-background-light/80 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl shadow-black/20 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg flex items-center justify-center">
                  {icon}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                {description && <p className="text-gray-400 text-sm">{description}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-700/50 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}

