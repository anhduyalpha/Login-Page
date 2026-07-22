import React from 'react';

export const FormField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  error,
  helperText,
  icon: IconComponent
}) => {
  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-xs font-medium text-[#94a3b8] uppercase tracking-wider font-sans"
        >
          {label} {required && <span className="text-indigo-400">*</span>}
        </label>
      )}

      <div className="relative">
        {IconComponent && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748b]">
            <IconComponent className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`form-input w-full py-2.5 text-sm ${IconComponent ? 'pl-9' : 'pl-3.5'} pr-3.5 min-h-[44px]`}
        />
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-[#64748b]">{helperText}</p>
      )}

      {error && (
        <p className="text-[11px] text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
};
