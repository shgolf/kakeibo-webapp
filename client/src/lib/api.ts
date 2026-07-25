import type {Expense, ExpenseInput} from "@/types/expense";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
        headers: {"Content-Type": "application/json"},
        ...options,
    });
    if (!res.ok) {
        let message = `エラーが発生しました (${res.status})`;
        let fieldErrors: Record<string, string> = {};
        try {
            const body = await res.json();
            if (body?.errors) {
                fieldErrors = body.errors;
                message = body?.title ?? "入力内容に不備があります";
            } else if (body?.detail) {
                message = body.detail;
            }
        } catch {
            // body が JSON でないときは既定メッセージのまま
        }
        throw new ApiError(message, fieldErrors);
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

export class ApiError extends Error {
    fieldErrors: Record<string, string>;

    constructor(message: string, fieldErrors: Record<string, string> = {}) {
        super(message); // 親にmessageを渡すことで.messageになる
        this.name = "ApiError";
        this.fieldErrors = fieldErrors;
    }
}