export type Category = "FOOD" | "TRANSPORT" | "CLOTHING" | "OTHER";

export type PaymentType = "CASH" | "CREDIT" | "TRANSFER";

export interface Expense {
    id: number;
    date: string;
    title: string;
    amount: number;
    category: Category | null;
    paymentType: PaymentType;
    memo: string | null;
    createdAt: string | null;
}

export interface ExpenseInput {
    date: string;
    title: string;
    amount: number;
    category: Category | null;
    paymentType: PaymentType;
    memo: string | null;
}
