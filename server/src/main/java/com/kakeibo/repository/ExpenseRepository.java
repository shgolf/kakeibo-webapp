package com.kakeibo.repository;

import com.kakeibo.model.Expense;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;

@Repository
public class ExpenseRepository {
    private final JdbcTemplate jdbc;

    // コンストラクタインジェクション（@Autowired は不要）
    public ExpenseRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Expense create(Expense expense) {
        String sql = "INSERT INTO expenses (title, amount, category, payment_type, memo, date) VALUES (?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});

            ps.setString(1, expense.getTitle());
            ps.setInt(2, expense.getAmount());
            ps.setString(3, expense.getCategory() == null ? null : expense.getCategory().name());
            ps.setString(4, expense.getPaymentType().name());
            ps.setString(5, expense.getMemo());
            ps.setObject(6, expense.getDate());
            return ps;
        }, keyHolder);

        expense.setId(keyHolder.getKey().longValue());
        return expense;
    }
}
