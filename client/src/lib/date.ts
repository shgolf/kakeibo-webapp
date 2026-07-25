/** Date → "2026-07-01"（カレンダー日付。UTCに変換しない） */
export function toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/** "2026-07-01" → Date（API から来た日付文字列を Calendar 等で使うとき） */
export function fromISODate(s: string): Date {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);   // ローカル0時で生成（ここでもUTCを避ける）
}

/** 今日が属する月 → "2026-07" */
export function currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}