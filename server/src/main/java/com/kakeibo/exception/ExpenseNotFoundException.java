package com.kakeibo.exception;

public class ExpenseNotFoundException extends RuntimeException {
    public ExpenseNotFoundException(Long id) {
        super("idが " + id + " の取引は存在しません");
    }
}
