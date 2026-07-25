import type {Category, PaymentType} from "@/types/expense.ts";

export const CATEGORY_LABELS: Record<Category, string> = {
    FOOD: "食費",
    TRANSPORT: "交通費",
    CLOTHING: "衣類",
    OTHER: "その他",
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
    CASH: "現金",
    CREDIT: "クレジット",
    TRANSFER: "振込",
};