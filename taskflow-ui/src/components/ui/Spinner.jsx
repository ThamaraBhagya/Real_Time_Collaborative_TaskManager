// src/components/ui/Avatar.jsx
export default function Avatar({ username, avatarUrl, size = 8 }) {
    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={username}
                className={`w-${size} h-${size} rounded-full object-cover`}
            />
        )
    }

    return (
        <div
            className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0`}
            style={{ background: 'var(--accent)', color: '#fff' }}
            title={username}
        >
            {username?.[0]?.toUpperCase() ?? '?'}
        </div>
    )
}