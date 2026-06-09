import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-semibold text-[#4a5568]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg bg-[#f8fafc] px-3 py-[10px] text-sm text-[#2d3748]',
            'border-[1.5px] border-[#e2e8f0]',
            'placeholder:text-gray-400 focus:outline-none focus:border-[#0D2D6B] focus:ring-2 focus:ring-[#0D2D6B]/20 focus:bg-white',
            'disabled:bg-gray-100 disabled:cursor-not-allowed transition-all',
            !!icon && 'pl-9',
            error && 'border-red-400 focus:ring-red-400/20 focus:border-red-400',
            className,
          )}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
