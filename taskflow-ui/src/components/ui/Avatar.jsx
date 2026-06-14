// src/components/ui/Avatar.jsx

export default function Avatar({ username, avatarUrl, size = 32 }) {
    const commonStyles = {
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        border: '2px solid var(--bg-secondary)', // Lassan overlap effect ekak enawa group kalama
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={username}
                title={username}
                style={{ ...commonStyles, objectFit: 'cover' }}
            />
        )
    }

    // Fallback UI if no image
    return (
        <div
            title={username}
            style={{
                ...commonStyles,
                background: 'linear-gradient(135deg, var(--accent) 0%, rgba(99, 102, 241, 0.7) 100%)',
                color: '#fff',
                fontSize: Math.max(10, size * 0.4), // Size eka anuwa akuru auto loku wenawa
                fontWeight: 600,
                textTransform: 'uppercase'
            }}
        >
            {username?.[0] ?? '?'}
        </div>
    )
}