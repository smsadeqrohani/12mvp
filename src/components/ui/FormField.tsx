import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  help?: string;
  children: ReactNode;
}

export function FormField({ label, required, error, help, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {children}
      {help && <p className="text-gray-500 text-xs mt-1 text-right">{help}</p>}
      {error && <p className="text-red-400 text-xs mt-1 text-right">{error}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all ${className}`}
      {...props}
    />
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({ className = "", ...props }: TextAreaProps) {
  return (
    <textarea
      className={`w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all resize-none ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={`w-full bg-gray-700/50 backdrop-blur-sm text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

