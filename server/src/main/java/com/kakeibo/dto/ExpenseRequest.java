package com.kakeibo.dto;

import com.kakeibo.model.Category;
import com.kakeibo.model.Expense;
import com.kakeibo.model.PaymentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ExpenseRequest(
        @NotNull(message = "日付は必須です")
        LocalDate date,

        @NotBlank(message = "タイトルは必須です")
        @Size(max = 100, message = "タイトルは100文字以内で入力してください")
        String title,

        @NotNull(message = "金額は必須です")
        @Positive(message = "金額は正の数で入力してください")
        Integer amount,

        Category category,

        @NotNull(message = "支払方法は必須です")
        PaymentType paymentType,

        String memo
) {
    public Expense toEntity() {
        Expense expense = new Expense();
        expense.setDate(date);
        expense.setTitle(title);
        expense.setAmount(amount);
        expense.setCategory(category);
        expense.setPaymentType(paymentType);
        expense.setMemo(memo);
        return expense;
    }
}
