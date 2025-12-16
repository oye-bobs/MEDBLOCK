export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export function formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function truncateDID(did: string, length: number = 20): string {
    if (did.length <= length) return did
    return `${did.substring(0, length)}...`
}

export function truncateHash(hash: string, start: number = 8, end: number = 8): string {
    if (hash.length <= start + end) return hash
    return `${hash.substring(0, start)}...${hash.substring(hash.length - end)}`
}

export function copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text)
}
