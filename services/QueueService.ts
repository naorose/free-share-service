import { DatabaseService } from "./DatabaseService";
import { QueuedTrade } from "../models/QueuedTrade";

export class QueueService {
    private dbService: DatabaseService;

    constructor(dbService: DatabaseService) {
        this.dbService = dbService;
    }

    async addToQueue(queuedTrade: QueuedTrade): Promise<void> {
        const sql = `INSERT INTO market_order_queue (accountId, tickerSymbol, queueTime, isProcessed)
                     VALUES (?, ?, NOW(), false)`;
        await this.dbService.execute(sql, [queuedTrade.accountId, queuedTrade.tickerSymbol]);
    }

    async getUnprocessedOrders(): Promise<QueuedTrade[]> {
        const sql = `SELECT * FROM market_order_queue WHERE isProcessed = false`;
        const results = await this.dbService.query(sql);
        return results;
    }

    async processQueuedOrder(queuedItem: QueuedTrade) {
        const queueId = queuedItem.queueId;
        const sql = `UPDATE market_order_queue SET isProcessed = true, processedTimestamp = NOW() 
                     WHERE queueId = ?`;
        await this.dbService.execute(sql, [queueId]);
    }
}