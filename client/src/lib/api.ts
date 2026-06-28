import type {Expense, ExpenseInput} from "@/types/expense";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
        headers: {"Content-Type": "application/json"},
        ...options,
    });
    if (!res.ok) {
        // 400(バリデーション)や500をここで一括ハンドリング
        throw new Error(`API error ${res.status}`);
    }
    // 204 No Content 対策
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