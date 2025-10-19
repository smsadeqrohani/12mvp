import React, { useRef, useEffect } from 'react';
import { TextInput as RNTextInput, TextInputProps, Platform } from 'react-native';

interface CustomTextInputProps extends TextInputProps {
  variant?: 'default' | 'multiline';
  className?: string;
}

export function TextInput({ 
  variant = 'default', 
  className = '',
  style,
  ...props 
}: CustomTextInputProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // On web, use native HTML input with proper styling and no conflicts
  if (Platform.OS === 'web') {
    const webStyle: React.CSSProperties = {
      // Reset any potential conflicts
      all: 'unset',
      boxSizing: 'border-box',
      
      // Core styling
      display: 'block',
      width: '100%',
      minHeight: variant === 'multiline' ? '72px' : '48px',
      padding: '12px 16px',
      fontSize: '14px',
      lineHeight: '1.5',
      fontFamily: 'Vazirmatn-Regular, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      
      // Colors and borders
      backgroundColor: '#0a2840',
      color: '#ffffff',
      border: '1px solid #4B5563',
      borderRadius: '8px',
      
      // Remove default browser styling
      outline: 'none',
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      
      // Ensure it's interactive
      cursor: 'text',
      
      // Handle multiline
      resize: variant === 'multiline' ? 'vertical' : 'none',
      
      // Override any global RTL that might interfere
      direction: 'ltr',
      textAlign: props.textAlign === 'right' ? 'right' : 'left',
      
      // Merge with custom styles
      ...style,
    };

    // Handle focus state
    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.target.style.borderColor = '#ff701a'; // accent color
      props.onFocus?.(e as any);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.target.style.borderColor = '#4B5563';
      props.onBlur?.(e as any);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (props.onChangeText) {
        props.onChangeText(e.target.value);
      }
    };

    // Ensure the input is properly initialized
    useEffect(() => {
      if (inputRef.current && props.value !== undefined) {
        inputRef.current.value = props.value;
      }
    }, [props.value]);

    if (variant === 'multiline') {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          style={webStyle}
          placeholder={props.placeholder}
          defaultValue={props.value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          rows={3}
          dir={props.textAlign === 'right' ? 'rtl' : 'ltr'}
          autoComplete={props.autoComplete}
          autoCorrect={props.autoCorrect}
          autoFocus={props.autoFocus}
          disabled={props.editable === false}
          maxLength={props.maxLength}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        style={webStyle}
        placeholder={props.placeholder}
        defaultValue={props.value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        type={props.secureTextEntry ? 'password' : props.keyboardType === 'email-address' ? 'email' : 'text'}
        autoCapitalize={props.autoCapitalize}
        autoComplete={props.autoComplete}
        autoCorrect={props.autoCorrect}
        autoFocus={props.autoFocus}
        disabled={props.editable === false}
        maxLength={props.maxLength}
        onSubmit={(e) => {
          e.preventDefault();
          props.onSubmitEditing?.(e as any);
        }}
        dir={props.textAlign === 'right' ? 'rtl' : 'ltr'}
      />
    );
  }

  // For React Native platforms, use the standard TextInput
  const baseStyle = {
    backgroundColor: '#0a2840',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#4B5563',
    width: '100%',
  };

  const multilineStyle = variant === 'multiline' ? {
    minHeight: 72,
    textAlignVertical: 'top' as const,
  } : {
    minHeight: 48,
  };

  return (
    <RNTextInput
      {...props}
      style={[baseStyle, multilineStyle, style]}
      placeholderTextColor="#9ca3af"
    />
  );
}