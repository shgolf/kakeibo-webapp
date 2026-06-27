package com.kakeibo.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Expense {
    private Long id;
    private String title;
    private Integer amount;
    private Category category;
    private PaymentType paymentType;
    private String memo;
    private LocalDate date;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Integer getAmount() {
        return amount;
    }

    public Category getCategory() {
        return category;
    }

    public PaymentType getPaymentType() {
        return paymentType;
    }

    public String getMemo() {
        return memo;
    }

    public LocalDate getDate() {
        return date;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public void setPaymentType(PaymentType paymentType) {
        this.paymentType = paymentType;
    }

    public void setMemo(String memo) {
        this.memo = memo;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
