// src/components/board/InviteMemberModal.jsx
import { useState } from 'react'
import { addMember } from '../../api/boards'
import toast from 'react-hot-toast'
import { X, UserPlus, Shield, User, Eye } from 'lucide-react'


const ROLES = [
    { value: 'ADMIN',  desc: 'Can manage board, members and all cards', icon: Shield },
    { value: 'MEMBER', desc: 'Can create, edit and move cards', icon: User },
    { value: 'VIEWER', desc: 'Can only view the board', icon: Eye },
]

export default function InviteMemberModal({ boardId, onClose, onInvited }) {
    const [username, setUsername] = useState('')
    const [role, setRole] = useState('MEMBER')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!username.trim()) return
        setLoading(true)
        try {
            await addMember(boardId, { username: username.trim(), role })
            toast.success(`${username} added to the board!`)
            onInvited?.()
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.message || 'User not found')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 50
        }}
             onClick={e => e.target === e.currentTarget && onClose()}>

            <div style={{
                width: '100%', maxWidth: '480px', borderRadius: '20px', overflow: 'hidden',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease-out'
            }}>

                {/* 📝 Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px', borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-secondary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            background: 'rgba(99, 102, 241, 0.1)', padding: '8px',
                            borderRadius: '10px', display: 'flex'
                        }}>
                            <UserPlus size={18} style={{ color: 'var(--accent)' }} />
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Invite to Board
                        </span>
                    </div>
                    <button onClick={onClose}
                            style={{
                                padding: '8px', borderRadius: '10px', border: '1px solid transparent',
                                background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                                transition: 'all 0.2s', display: 'flex'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = 'var(--text-primary)';
                                e.currentTarget.style.background = 'var(--bg-hover)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}>
                        <X size={18} />
                    </button>
                </div>

                {/* ⚙️ Body */}
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Username Input */}
                    <div>
                        <label style={{
                            display: 'block', fontSize: '13px', fontWeight: 600,
                            color: 'var(--text-secondary)', marginBottom: '8px'
                        }}>
                            Username
                        </label>
                        <input value={username}
                               onChange={e => setUsername(e.target.value)}
                               placeholder="Enter their username..."
                               autoFocus required
                               style={{
                                   width: '100%', padding: '12px 16px', borderRadius: '10px',
                                   background: 'var(--bg-input)', color: 'var(--text-primary)',
                                   border: '1px solid var(--border)', fontSize: '15px', outline: 'none',
                                   transition: 'all 0.2s', fontWeight: 500
                               }}
                               onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'; }}
                               onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label style={{
                            display: 'block', fontSize: '13px', fontWeight: 600,
                            color: 'var(--text-secondary)', marginBottom: '10px'
                        }}>
                            Select Role
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {ROLES.map(r => {
                                const isSelected = role === r.value;
                                const Icon = r.icon;

                                return (
                                    <label key={r.value}
                                           style={{
                                               display: 'flex', alignItems: 'center', gap: '14px',
                                               padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                                               background: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-hover)',
                                               border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                                               transition: 'all 0.2s',
                                               boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none'
                                           }}
                                           onMouseEnter={e => { if(!isSelected) e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                                           onMouseLeave={e => { if(!isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}>

                                        {/* Hidden Native Radio */}
                                        <input type="radio" name="role" value={r.value}
                                               checked={isSelected}
                                               onChange={() => setRole(r.value)}
                                               style={{ display: 'none' }} />

                                        {/* Custom Radio Button UI */}
                                        <div style={{
                                            width: '18px', height: '18px', borderRadius: '50%',
                                            border: isSelected ? '5px solid var(--accent)' : '2px solid var(--text-muted)',
                                            transition: 'border 0.2s ease-in-out', flexShrink: 0
                                        }} />

                                        {/* Icon */}
                                        <div style={{
                                            color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                                            display: 'flex', alignItems: 'center', transition: 'color 0.2s'
                                        }}>
                                            <Icon size={18} />
                                        </div>

                                        {/* Text Content */}
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                margin: '0 0 2px 0', fontSize: '14px', fontWeight: 600,
                                                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                transition: 'color 0.2s'
                                            }}>
                                                {r.value.charAt(0) + r.value.slice(1).toLowerCase()}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                                                {r.desc}
                                            </p>
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <button type="button" onClick={onClose}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '10px',
                                    background: 'transparent', border: '1px solid var(--border)',
                                    color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading || !username.trim()}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                                    background: 'var(--accent)', color: '#fff',
                                    fontSize: '14px', fontWeight: 600, cursor: (loading || !username.trim()) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s', opacity: (loading || !username.trim()) ? 0.7 : 1,
                                    boxShadow: (loading || !username.trim()) ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)'
                                }}
                                onMouseEnter={e => { if(!loading && username.trim()) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)'; } }}
                                onMouseLeave={e => { if(!loading && username.trim()) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)'; } }}>
                            {loading ? 'Sending...' : 'Send Invite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}