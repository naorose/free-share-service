// Mock data for demonstration purposes

const mockAssets = [
  { tickerSymbol: "AAPL" },
  { tickerSymbol: "MSFT" },
  { tickerSymbol: "TSLA" }
];

const mockPrices: { [key: string]: number } = {
  "AAPL": 150,
  "MSFT": 210,
  "TSLA": 680
};

// Mock methods for demonstration purposes

const Broker = {
  listTradableAssets: async (): Promise<Array<{ tickerSymbol: string }>> => {
    // To fetch a list of assets available for trading
    return mockAssets;
  },

  getLatestPrice: async (tickerSymbol: string): Promise<{ sharePrice: number }> => {
    // Return the latest price for a given asset (mocked)
    return { sharePrice: mockPrices[tickerSymbol] || 0 };
  },

  isMarketOpen: async (): Promise<{ open: boolean, nextOpeningTime: string, nextClosingTime: string }> => {
    // Return mock market status (mocked)
    return { open: true, nextOpeningTime: "09:00", nextClosingTime: "17:00" };
  },

  placeBuyOrderUsingEmmaFunds: async (accountId: string, tickerSymbol: string, quantity: number): Promise<{ orderId: string }> => {
    // Simulate placing a buy order and return a mock order ID (mocked)
    return { orderId: `order-${accountId}-${tickerSymbol}-${quantity}` };
  },

  getAccountPositions: async (accountId: string): Promise<Array<{ tickerSymbol: string, quantity: number, sharePrice: number }>> => {
    // Return mock data for shares purchased in an account (mocked)
    return [{ tickerSymbol: "AAPL", quantity: 1, sharePrice: 150 }];
  },

  getAllOrders: async (accountId: string): Promise<Array<{ id: string, tickerSymbol: string, quantity: number, side: 'buy' | 'sell', status: 'open' | 'filled' | 'failed', filledPrice: number }>> => {
    // Return mock data for all orders in an account (mocked)
    return [{ id: `order-${accountId}-AAPL`, tickerSymbol: "AAPL", quantity: 1, side: 'buy', status: 'filled', filledPrice: 150 }];
  }
};

export default Broker;
