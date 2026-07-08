// src/components/ui/PriorityBadge.jsx
import { AlertCircle, ArrowDown, ArrowUp, ArrowRight } from 'lucide-react'

const PRIORITIES = {
    LOW:    { bg: 'rgba(34, 197, 94, 0.1)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.2)', icon: ArrowDown },
    MEDIUM: { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.2)', icon: ArrowRight },
    HIGH:   { bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.2)', icon: ArrowUp },
    URGENT: { bg: 'rgba(236, 72, 153, 0.1)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.2)', icon: AlertCircle },
}

export default function PriorityBadge({ priority }) {
    const config = PRIORITIES[priority] || PRIORITIES.MEDIUM
    const Icon = config.icon

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: config.bg,
            color: config.text,
            border: `1px solid ${config.border}`,
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.03em',
            textTransform: 'capitalize',
            lineHeight: 1
        }}>
            <Icon size={12} strokeWidth={2.5} />
            {priority.toLowerCase()}
        </span>
    )
}