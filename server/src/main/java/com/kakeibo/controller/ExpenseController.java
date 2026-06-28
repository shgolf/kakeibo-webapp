package com.kakeibo.controller;

import com.kakeibo.dto.ExpenseRequest;
import com.kakeibo.dto.ExpenseResponse;
import com.kakeibo.model.Expense;
import com.kakeibo.service.ExpenseService;
import jakarta.validation.Valid;
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
    public ExpenseResponse create(@Valid @RequestBody ExpenseRequest request) {
        Expense expense = request.toEntity();
        return ExpenseResponse.from(expenseService.create(expense));
    }

    @GetMapping
    public List<ExpenseResponse> findAll() {
        return expenseService.findAll().stream()
                .map(ExpenseResponse::from)
                .toList();
    }

    @GetMapping("/id")
    public Optional<ExpenseResponse> findById(@RequestParam Long id) {
        return expenseService.findById(id).stream().map(ExpenseResponse::from).findFirst();
    }
}
