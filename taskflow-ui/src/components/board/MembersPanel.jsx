// src/components/board/MembersPanel.jsx
import { useState } from 'react'
import { removeMember, updateMemberRole } from '../../api/boards'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { X, Crown, Shield, Eye, ChevronDown, UserMinus, Users } from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'

const ROLE_META = {
    ADMIN:  { icon: Crown,  color: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' },
    MEMBER: { icon: Shield, color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)'  },
    VIEWER: { icon: Eye,    color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
}

export default function MembersPanel({ board, onClose, onUpdate }) {
    const currentUser = useAuthStore(s => s.user)
    const [openMenu, setOpenMenu] = useState(null)
    const [memberToRemove, setMemberToRemove] = useState(null)

    const myRole = board.members?.find(m => m.userId === currentUser?.id)?.role
    const isAdmin = myRole === 'ADMIN'

    const confirmRemove = (userId, username) => {
        setMemberToRemove({ userId, username })
        setOpenMenu(null)
    }

    const executeRemove = async () => {
        if (!memberToRemove) return
        try {
            await removeMember(board.id, memberToRemove.userId)
            toast.success(`${memberToRemove.username} removed from board`)
            onUpdate()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove member')
        }
        setMemberToRemove(null)
    }

    const handleRoleChange = async (userId, role) => {
        try {
            await updateMemberRole(board.id, userId, role)
            toast.success('Role updated successfully')
            onUpdate()
        } catch {
            toast.error('Failed to update role')
        }
        setOpenMenu(null)
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
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease-out',
                display: 'flex', flexDirection: 'column', maxHeight: '85vh'
            }}>

                {/*  Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px', borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-secondary)', flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            background: 'rgba(99, 102, 241, 0.1)', padding: '8px',
                            borderRadius: '10px', display: 'flex'
                        }}>
                            <Users size={18} style={{ color: 'var(--accent)' }} />
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Board Members <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>· {board.members?.length}</span>
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

                {/*  Members List */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                    {board.members?.map(member => {
                        const meta = ROLE_META[member.role]
                        const RoleIcon = meta?.icon || Eye
                        const isOwner = member.userId === board.ownerId
                        const isSelf = member.userId === currentUser?.id
                        const canManage = isAdmin && !isOwner && !isSelf

                        return (
                            <div key={member.userId}
                                 style={{
                                     display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                     padding: '12px 16px', borderRadius: '16px',
                                     background: 'var(--bg-secondary)', border: '1px solid transparent',
                                     transition: 'all 0.2s'
                                 }}
                                 onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                                 onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'transparent'; }}>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--accent) 0%, rgba(99, 102, 241, 0.7) 100%)',
                                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '15px', fontWeight: 600, flexShrink: 0,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}>
                                        {member.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {member.username}
                                                {isSelf && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (You)</span>}
                                            </span>
                                            {isOwner && (
                                                <span style={{
                                                    fontSize: '11px', padding: '2px 6px', borderRadius: '6px',
                                                    background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', fontWeight: 600,
                                                    letterSpacing: '0.02em', textTransform: 'uppercase'
                                                }}>
                                                    Owner
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                            <div style={{ background: meta.bg, padding: '2px', borderRadius: '4px' }}>
                                                <RoleIcon size={12} style={{ color: meta.color }} />
                                            </div>
                                            <span style={{ fontSize: '12px', color: meta.color, fontWeight: 500, letterSpacing: '0.01em' }}>
                                                {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {canManage && (
                                    <div style={{ position: 'relative' }}>
                                        <button onClick={() => setOpenMenu(openMenu === member.userId ? null : member.userId)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                                                    color: 'var(--text-secondary)', background: 'var(--bg-card)',
                                                    border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                                            Manage <ChevronDown size={14} />
                                        </button>

                                        {openMenu === member.userId && (
                                            <>
                                                {/* Invisible backdrop to close menu when clicking outside */}
                                                <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpenMenu(null)} />

                                                <div style={{
                                                    position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: '160px',
                                                    borderRadius: '12px', padding: '6px', zIndex: 20,
                                                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                                                    boxShadow: '0 12px 32px rgba(0,0,0,0.4)', animation: 'fadeIn 0.15s ease-out'
                                                }}>
                                                    <p style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                        Change Role
                                                    </p>
                                                    {['ADMIN', 'MEMBER', 'VIEWER'].map(r => (
                                                        <button key={r} onClick={() => handleRoleChange(member.userId, r)}
                                                                style={{
                                                                    width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: '13px',
                                                                    fontWeight: 500, borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.1s',
                                                                    color: member.role === r ? 'var(--accent)' : 'var(--text-secondary)',
                                                                    background: member.role === r ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                                                }}
                                                                onMouseEnter={e => { if(member.role !== r) e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                                                onMouseLeave={e => { if(member.role !== r) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                                                            {r.charAt(0) + r.slice(1).toLowerCase()}
                                                        </button>
                                                    ))}
                                                    <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0' }} />
                                                    <button onClick={() => confirmRemove(member.userId, member.username)}
                                                            style={{
                                                                width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: '13px',
                                                                fontWeight: 500, borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.1s',
                                                                color: 'var(--danger)', background: 'transparent',
                                                                display: 'flex', alignItems: 'center', gap: '8px'
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                        <UserMinus size={14} /> Remove Member
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <ConfirmModal
                isOpen={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                onConfirm={executeRemove}
                title="Remove Member"
                message={`Are you sure you want to remove "${memberToRemove?.username}" from this board? They will lose access to all columns and cards.`}
                confirmText="Remove"
            />
        </div>
    )
}