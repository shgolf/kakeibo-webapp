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
        @NotNull(message = "Date is required")
        LocalDate date,

        @NotBlank(message = "Title is required")
        @Size(max = 100, message = "Title must be at most 100 characters")
        String title,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be a positive number")
        Integer amount,

        Category category,

        @NotNull(message = "Payment type is required")
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
