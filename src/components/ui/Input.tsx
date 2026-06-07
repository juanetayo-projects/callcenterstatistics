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
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
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
            'w-full rounded-lg border border-[#e2e8f0] bg-gray-50 px-3 py-2.5 text-sm text-[#1e293b]',
            'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D2D6B] focus:border-transparent focus:bg-white',
            'disabled:bg-gray-100 disabled:cursor-not-allowed transition-all',
            !!icon && 'pl-9',
            error && 'border-red-400 focus:ring-red-500',
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
