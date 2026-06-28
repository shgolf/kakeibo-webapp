package com.kakeibo.dto;

import com.kakeibo.model.Category;
import com.kakeibo.model.Expense;
import com.kakeibo.model.PaymentType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ExpenseResponse(
        Long id,
        LocalDate date,
        String title,
        Integer amount,
        Category category,
        PaymentType paymentType,
        String memo,
        LocalDateTime createdAt
) {
    public static ExpenseResponse from(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getDate(),
                expense.getTitle(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getPaymentType(),
                expense.getMemo(),
                expense.getCreatedAt()
        );
    }
}
