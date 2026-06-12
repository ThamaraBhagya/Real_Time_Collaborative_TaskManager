// src/components/ui/PriorityBadge.jsx
const COLORS = {
    LOW:    { bg: '#1e3a2e', text: '#10b981' },
    MEDIUM: { bg: '#1e2a3a', text: '#60a5fa' },
    HIGH:   { bg: '#3a2a1e', text: '#f59e0b' },
    URGENT: { bg: '#3a1e2a', text: '#ec4899' },
}

export default function PriorityBadge({ priority }) {
    const c = COLORS[priority] || COLORS.MEDIUM
    return (
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{background: c.bg, color: c.text}}>
      {priority}
    </span>
    )
}