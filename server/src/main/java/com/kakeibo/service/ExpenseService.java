package com.kakeibo.service;

import com.kakeibo.dto.ExpenseRequest;
import com.kakeibo.exception.ExpenseNotFoundException;
import com.kakeibo.model.Expense;
import com.kakeibo.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public Expense create(Expense expense) {
        return expenseRepository.create(expense);
    }

    public List<Expense> findAll() {
        return expenseRepository.findAll();
    }

    public Expense findById(Long id) {
        return expenseRepository.findById(id).orElseThrow(() -> new ExpenseNotFoundException(id));
    }

    public Expense update(Long id, ExpenseRequest request) {
        int affected = expenseRepository.update(id, request);
        if (affected == 0) {
            throw new ExpenseNotFoundException(id);
        } else {
            return expenseRepository.findById(id).orElseThrow(() -> new ExpenseNotFoundException(id));
        }
    }

    public void delete(Long id) {
        int affected = expenseRepository.deleteById(id);
        if (affected == 0) {
            throw new ExpenseNotFoundException(id);
        }
    }
}
