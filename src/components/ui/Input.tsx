import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, style, ...props }, ref) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', letterSpacing: '0.01em' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}>
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(className)}
          style={{
            width: '100%',
            paddingTop: '10px',
            paddingBottom: '10px',
            paddingLeft: icon ? '40px' : '12px',
            paddingRight: '12px',
            borderRadius: '8px',
            border: error ? '1.5px solid #f87171' : '1.5px solid #e2e8f0',
            fontSize: '14px',
            color: '#2d3748',
            outline: 'none',
            backgroundColor: '#f8fafc',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            ...style,
          }}
          onFocus={e => {
            e.target.style.borderColor = '#0D2D6B';
            e.target.style.boxShadow = '0 0 0 3px rgba(13,45,107,0.12)';
            e.target.style.backgroundColor = '#fff';
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? '#f87171' : '#e2e8f0';
            e.target.style.boxShadow = 'none';
            e.target.style.backgroundColor = '#f8fafc';
          }}
          {...props}
        />
      </div>
      {hint && !error && <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{hint}</p>}
      {error && <p style={{ fontSize: '11px', color: '#ef4444', margin: 0, fontWeight: '500' }}>{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
