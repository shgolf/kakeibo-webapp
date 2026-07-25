import type {Expense, ExpenseInput} from "@/types/expense";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
        headers: {"Content-Type": "application/json"},
        ...options,
    });
    if (!res.ok) {
        let message = `エラーが発生しました (${res.status})`;
        try {
            const body = await res.json();
            if (body?.errors) {
                // {title: "...", amount: "..."} → 右のvaluesの部分を改行区切りの1文字列に
                message = Object.values(body.errors).join("\n");
            } else if (body?.detail) {
                message = body.detail;
            }
        } catch {
            // body が JSON でないときは既定メッセージのまま
        }
        throw new Error(message);
    }
    return res.status === 204 ? (undefined as T) : await res.json();
}

export const api = {
    listExpenses: () => request<Expense[]>("/expenses"),
    createExpense: (input: ExpenseInput) =>
        request<Expense>("/expenses", {
            method: "POST",
            body: JSON.stringify(input),
        }),
};