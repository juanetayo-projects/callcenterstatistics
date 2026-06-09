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

const maxWidths: Record<string, string> = {
  sm: '380px', md: '520px', lg: '680px', xl: '860px',
};

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(13,45,107,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Card */}
      <div style={{
        position: 'relative', backgroundColor: 'white', borderRadius: '16px',
        width: '100%', maxWidth: maxWidths[size], maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(13,45,107,0.28)',
        overflow: 'hidden',
      }}>

        {/* Header azul degradado */}
        <div style={{
          background: 'linear-gradient(135deg, #0D2D6B 0%, #16468E 100%)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ color: 'white', fontSize: '17px', fontWeight: '700', margin: 0, letterSpacing: '0.2px' }}>{title}</h2>
            {subtitle && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', margin: '4px 0 0' }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '6px', display: 'flex', color: 'rgba(255,255,255,0.8)', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: '10px',
            padding: '16px 24px', borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc', flexShrink: 0,
          }}>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', marginTop: '4px' }}>
      <div style={{
        padding: '5px', borderRadius: '7px',
        background: 'linear-gradient(135deg, #0D2D6B, #16468E)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon style={{ width: '13px', height: '13px', color: 'white' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: '700', color: '#0D2D6B', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(13,45,107,0.12)' }} />
    </div>
  );
}
