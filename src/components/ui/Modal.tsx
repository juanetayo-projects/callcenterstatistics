import { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0D2D6B]/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full mx-auto ${sizes[size]} max-h-[90vh] flex flex-col`}
        style={{ boxShadow: '0 25px 60px rgba(13,45,107,0.25)' }}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #0D2D6B 0%, #16468E 100%)', borderRadius: '16px 16px 0 0' }}>
          <div>
            <h2 className="text-base font-bold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-white/60 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0] flex-shrink-0 bg-gray-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Divisor de sección dentro de formularios */
export function FormSection({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="p-1.5 bg-[#0D2D6B]/10 rounded-lg">
        <Icon className="h-3.5 w-3.5 text-[#0D2D6B]" />
      </div>
      <span className="text-xs font-bold text-[#0D2D6B] uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-[#0D2D6B]/10" />
    </div>
  );
}
