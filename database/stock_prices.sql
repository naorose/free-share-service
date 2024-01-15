CREATE TABLE stock_prices (
    priceId INT AUTO_INCREMENT PRIMARY KEY,
    tickerSymbol VARCHAR(10) NOT NULL,
    recordedPrice DECIMAL(10, 2) NOT NULL,
    recordedTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tickerSymbol) REFERENCES stocks(tickerSymbol)
);
