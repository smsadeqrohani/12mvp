import { ReactNode } from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  help?: string;
  children: ReactNode;
}

export function FormField({ label, required, error, help, children }: FormFieldProps) {
  return (
    <View>
      <Text className="text-sm font-medium text-gray-300 mb-2 text-right" style={{ fontFamily: "Meem-Medium" }}>
        {label} {required && <Text className="text-accent" style={{ fontFamily: "Meem-Medium" }}>*</Text>}
      </Text>
      {children}
      {help && <Text className="text-gray-500 text-xs mt-1 text-right" style={{ fontFamily: "Meem-Regular" }}>{help}</Text>}
      {error && <Text className="text-red-400 text-xs mt-1 text-right" style={{ fontFamily: "Meem-Regular" }}>{error}</Text>}
    </View>
  );
}

interface InputComponentProps extends TextInputProps {
  className?: string;
}

export function Input({ className = "", ...props }: InputComponentProps) {
  return (
    <TextInput
      className={`w-full bg-gray-700/50 text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 ${className}`}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  );
}

interface TextAreaComponentProps extends TextInputProps {
  className?: string;
  rows?: number;
}

export function TextArea({ className = "", rows = 4, ...props }: TextAreaComponentProps) {
  return (
    <TextInput
      className={`w-full bg-gray-700/50 text-white rounded-lg px-4 py-3 text-sm border border-gray-600/50 ${className}`}
      placeholderTextColor="#9ca3af"
      multiline
      numberOfLines={rows}
      textAlignVertical="top"
      {...props}
    />
  );
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: ReactNode;
}

export function Select({ value, onValueChange, className = "", children }: SelectProps) {
  return (
    <View className={`w-full bg-gray-700/50 rounded-lg border border-gray-600/50 ${className}`}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={{ color: "#fff" }}
      >
        {children}
      </Picker>
    </View>
  );
}

