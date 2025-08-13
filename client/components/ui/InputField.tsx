'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  icon
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="mb-6">
      <label className="block text-lg font-black text-black mb-2 tracking-tight">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-3 border-4 border-black rounded-2xl font-bold text-black
            placeholder-gray-500 bg-white transition-all duration-200
            ${isFocused ? 'shadow-[4px_4px_0px_0px_#000]' : 'shadow-[2px_2px_0px_0px_#000]'}
            ${isFocused ? 'translate-x-[-2px] translate-y-[-2px]' : ''}
            ${error ? 'border-red-500 bg-red-50' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]'}
            focus:outline-none
            ${icon ? 'pl-12' : ''}
            ${isPassword ? 'pr-12' : ''}
          `}
        />
        
        {/* Left Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black">
            {icon}
          </div>
        )}

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 border-2 border-black rounded-lg bg-yellow-300 hover:bg-yellow-200 transition-colors"
            disabled={disabled}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-black" />
            ) : (
              <Eye className="w-4 h-4 text-black" />
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 border-3 border-red-500 rounded-xl bg-red-100">
          <p className="text-sm font-bold text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <div className="mt-2 p-2 border-2 border-gray-300 rounded-xl bg-gray-50">
          <p className="text-sm font-medium text-gray-600">
            {helperText}
          </p>
        </div>
      )}
    </div>
  );
};
