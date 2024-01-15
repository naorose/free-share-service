CREATE TABLE orders (
    orderId INT AUTO_INCREMENT PRIMARY KEY,
    accountId VARCHAR(255) NOT NULL,
    tickerSymbol VARCHAR(10) NOT NULL,
    orderType ENUM('BUY', 'SELL') NOT NULL,
    sharePrice DECIMAL(10, 2) NOT NULL,
    transactionType ENUM('purchase', 'reward') NOT NULL,
    quantity INT NOT NULL,
    orderTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (accountId) REFERENCES users(accountId)
);
