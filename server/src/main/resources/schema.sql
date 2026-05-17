CREATE TABLE IF NOT EXISTS expenses (
                                        id            BIGSERIAL PRIMARY KEY,
                                        title         VARCHAR(100) NOT NULL,
    amount        INTEGER NOT NULL,
    category      VARCHAR(50),
    payment_type  VARCHAR(10) NOT NULL, -- 'cash' / 'credit' / 'transfer'
    memo          TEXT,
    date          DATE NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );