package com.kakeibo.repository;

import com.kakeibo.model.Category;
import com.kakeibo.model.Expense;
import com.kakeibo.model.PaymentType;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class ExpenseRowMapper implements RowMapper<Expense> {
    @Override
    public Expense mapRow(ResultSet rs, int rowNum) throws SQLException {
        Expense expense = new Expense();
        expense.setId(rs.getLong("id"));
        expense.setTitle(rs.getString("title"));
        expense.setAmount(rs.getInt("amount"));
        String categoryStr = rs.getString("category");
        expense.setCategory(categoryStr != null ? Category.valueOf(categoryStr) : null);
        expense.setPaymentType(PaymentType.valueOf(rs.getString("payment_type")));
        expense.setMemo(rs.getString("memo"));
        expense.setDate(rs.getDate("date").toLocalDate());
        var createdAt = rs.getTimestamp("created_at");
        expense.setCreatedAt(createdAt != null ? createdAt.toLocalDateTime() : null);
        return expense;
    }
}
