# 📈 Emma: Free Share Reward Service

## Overview

This project implements a backend service for a free stock trading application. It's designed to reward new customers with a free share of stock when they sign up. The core functionality includes a `POST /claim-free-share` endpoint allowing eligible customers to claim their free share, with the stock randomly chosen within specified value limits.

## Project Structure

- **`app.ts`**: The main server file, implementing the Express.js app and the `/claim-free-share` endpoint.
- **`models/`**: Contains data models (`Asset`, `AssetTier`, `Order`, `QueuedTrade`, `Trade`) used throughout the application.
- **`services/`**: 
  - `UserService.ts`, `DatabaseService.ts`, `QueueService.ts`, `CPAService.ts`: Provide functionalities like user management, database operations, trade queuing, and CPA calculations.
  - `Broker.ts`: Mocks the Broker API, handling stock-related operations.

- **`utilities/`**: Includes utility classes like `AssetSelector`.
- **`tests/`**: Contains `app.test.ts` for testing different components of the app.
- **`database/`**: SQL scripts for creating necessary database tables.
- **`Dockerfile`**: For containerizing the application.
- **`jest.config.js`**: Configuration for Jest testing framework.

## Key Features

1. **Configurable Share Value Range**: Easily configure minimum and maximum share values through environment variables, giving you control over the cost of shares distributed as rewards.

2. **Tier-Based Random Asset Selection**: Employs the algorithm in `AssetSelector` to randomly select stocks based on predefined value tiers. This approach aligns with target distribution percentages (95% for £3-£10, 3% for £10-£25, and 2% for £25-£200). Using the appropriate flag, this can also use CPA (Cost Per Acquisition) instead.

3. **Market Status Handling**: Ensures that stock market status is continuously monitored. If the market is closed, it queues orders for processing at the next available opportunity, guaranteeing timely trades.

4. **Queue Management for Pending Trades**: The `QueueService` expertly manages trades that cannot be executed immediately, eliminating the risk of lost trade requests, during non-market hours.

5. **CPA (Cost Per Acquisition) Monitoring**: The `CPAService` is dedicated to calculating the current CPA and adjusting asset selection strategies to align with your financial targets.

6. **Price Fluctuation Management**: Before executing a trade, the system checks for significant price fluctuations, guaranteeing that the share's price remains within an acceptable threshold.

7. **Delisting Detection**: Conducts thorough checks to ensure that the selected stock is still listed on the market before placing an order. This enhances the reliability and accuracy of stock selections.

8. **User Verification and Eligibility Checks**: The system includes checks for user eligibility, including new customer status, verification status, and whether they have previously claimed a free share.

9. **Automated Testing Framework**: The project incorporates a suite of automated tests (`app.test.ts`) that cover critical components like `AssetSelector`, ensuring the reliability and functionality of the codebase.

## Assumptions

- Assume that any databases and tables referenced in the SQL scripts in the 'database' directory are pre-existing and non-empty.
- The `Broker.listTradableAssets` method excludes queued assets, acknowledging that these trades are pending and not immediately tradable.
- Users can claim only one free share, and their eligibility is controlled via the `free_share_status` field in the user table.
- The market can be open or closed, affecting trade execution timing.
- Only whole shares are purchasable and holdable in accounts.
- In regards to the queueing mechanism, assume that an active event-triggering system _(e.g. AWS scheduled Lambda, Google Cloud Scheduler, Airflow, Cron Job, etc.)_ is in place, which automatically processes queued trades at the start of the market day or at an appropriate predetermined time. This ensures that all pending trades are executed timely and efficiently.


## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/naorose/free-share-service.git
   ```
2. Navigate to the project directory:
   ```bash
   cd free-share-service
   ```

## Running the Service

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```

## Running Tests

1. To run tests, execute:
   ```bash
   npm test
   ```

## Dockerization

To run the service within a Docker container:

1. Build the Docker image:
   ```bash
   docker build -t free-share-service .
   ```
2. Run the container:
   ```bash
   docker run -p 3000:3000 free-share-service
   ```

## Contact

For any inquiries or contributions, please contact me at [naorose@example.com](mailto:naorose@example.com).