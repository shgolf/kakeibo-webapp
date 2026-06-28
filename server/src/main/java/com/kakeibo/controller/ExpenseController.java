package com.kakeibo.controller;

import com.kakeibo.model.Expense;
import com.kakeibo.service.ExpenseService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Expense create(@RequestBody Expense expense) {
        return expenseService.create(expense);
    }

    @GetMapping
    public List<Expense> findAll() {
        return expenseService.findAll();
    }

    @GetMapping("/id")
    public Optional<Expense> findById(@RequestParam Long id) {
        return expenseService.findById(id);
    }
}
