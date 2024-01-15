import { Trade } from "./Trade";

export class Order implements Trade {
    accountId: string;
    tickerSymbol: string;
    orderTimestamp: Date;

    constructor(accountId: string, tickerSymbol: string, orderTimestamp: Date) {
        this.accountId = accountId;
        this.tickerSymbol = tickerSymbol;
        this.orderTimestamp = orderTimestamp;
    }
}
