CREATE TABLE users (
    accountId VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    free_share_status VARCHAR(255) NOT NULL,
    isVerified BOOLEAN DEFAULT FALSE,
    isActive BOOLEAN DEFAULT TRUE
);