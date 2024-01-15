CREATE TABLE stock (
    tickerSymbol VARCHAR(10) PRIMARY KEY,
    stockName VARCHAR(255) NOT NULL,
    isListed BOOLEAN DEFAULT TRUE
);
