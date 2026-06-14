// src/components/common/ConfirmModal.jsx
import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({
                                         isOpen,
                                         onClose,
                                         onConfirm,
                                         title,
                                         message,
                                         confirmText = "Delete"
                                     }) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(6px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-card)', padding: '32px', borderRadius: '16px',
                width: '100%', maxWidth: '440px', border: '1px solid var(--border)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                animation: 'fadeIn 0.2s ease-out'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        width: '48px', height: '48px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <AlertTriangle color="var(--danger)" size={24} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '-0.01em' }}>
                        {title}
                    </h3>
                </div>

                <p style={{ margin: '0 0 32px 0', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={onClose}
                            style={{
                                padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border)',
                                background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer',
                                fontSize: '15px', fontWeight: 500, transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        Cancel
                    </button>
                    <button onClick={() => { onConfirm(); onClose(); }}
                            style={{
                                padding: '10px 20px', borderRadius: '10px', border: 'none',
                                background: 'var(--danger)', color: '#fff', cursor: 'pointer',
                                fontSize: '15px', fontWeight: 600, transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                            }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}