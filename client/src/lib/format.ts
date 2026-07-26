export function formatYen(amount: number): string {
    return `¥${amount.toLocaleString("ja-JP")}`;
}

export function formatDate(iso: string): string {
    const [y, m, d] = iso.split("-").map(Number);
    return `${y}/${m}/${d}`;
}

/** "2026-06-28T11:51:48.091" → "2026年6月28日 11:51" */
export function formatDateTime(iso: string): string {
    const [datePart, timePart = ""] = iso.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm] = timePart.split(":");
    return `${y}年${m}月${d}日 ${hh}:${mm}`;
}