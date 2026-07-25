export function formatYen(amount: number): string {
    return `¥${amount.toLocaleString("ja-JP")}`;
}

export function formatDate(iso: string): string {
    const [y, m, d] = iso.split("-").map(Number);
    return `${y}/${m}/${d}`;
}

export function formatDateLong(iso: string): string {
    const [y, m, d] = iso.split("-").map(Number);
    return `${y}年${m}月${d}日`;
}