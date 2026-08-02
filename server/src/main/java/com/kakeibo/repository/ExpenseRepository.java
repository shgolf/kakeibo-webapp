package com.kakeibo.repository;

import com.kakeibo.dto.ExpenseRequest;
import com.kakeibo.model.Expense;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;

@Repository
public class ExpenseRepository {
    private final JdbcTemplate jdbc;
    private final ExpenseRowMapper rowMapper = new ExpenseRowMapper();

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

    public List<Expense> findAll() {
        String sql = "SELECT * FROM expenses ORDER BY date DESC, id DESC";
        return jdbc.query(sql, rowMapper);
    }

    public Optional<Expense> findById(Long id) {
        String sql = "SELECT * FROM expenses WHERE id = ?";
        try {
            Expense expense = jdbc.queryForObject(sql, rowMapper, id);
            return Optional.of(expense);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public int update(Long id, ExpenseRequest request) {
        String sql = """
                UPDATE expenses SET
                date = ?,
                title = ?,
                amount = ?,
                category = ?,
                payment_type = ?,
                memo = ?
                WHERE id = ?
                """;
        return jdbc.update(sql,
                request.date(),
                request.title(),
                request.amount(),
                request.category() == null ? null : request.category().name(),
                request.paymentType().name(),
                request.memo(),
                id
        );
    }

    public int deleteById(Long id) {
        return jdbc.update("DELETE FROM expenses WHERE id = ?", id);
    }
}
