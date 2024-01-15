import { Trade } from "./Trade";

export class QueuedTrade implements Trade {
    accountId: string;
    tickerSymbol: string;
    queueId?: number;
    queuedTimestamp: Date;
    isProcessed: boolean;

    constructor(accountId: string, tickerSymbol: string, queuedTimestamp: Date, isProcessed: boolean = false, queueId?: number) {
        this.accountId = accountId;
        this.tickerSymbol = tickerSymbol;
        this.queueId = queueId;
        this.queuedTimestamp = queuedTimestamp;
        this.isProcessed = isProcessed;
    }
}
