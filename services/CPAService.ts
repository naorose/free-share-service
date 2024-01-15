import { Asset } from "../models/Asset";
import { DatabaseService } from "./DatabaseService";
import Broker from "./Broker";

export class CPAService {
    private dbService: DatabaseService;

    constructor() {
        this.dbService = new DatabaseService();
    }

    async getCurrentCPA() {
        const totalSpentOnShares = await this.getTotalSpentOnShares();
        const totalSharesGiven = await this.getTotalSharesGiven();
        return totalSharesGiven > 0 ? totalSpentOnShares / totalSharesGiven : 0;
    }

    async getTotalSpentOnShares(): Promise<number> {
        const query = `SELECT SUM(sharePrice * quantity) AS totalSpent 
                       FROM orders 
                       WHERE transactionType = 'purchase';`;

        const result = await this.dbService.query(query);
        return result[0].totalSpent || 0;
    }

    async getTotalSharesGiven(): Promise<number> {
        const query = `SELECT COUNT(*) AS totalSharesGiven 
                   FROM users 
                   WHERE free_share_status = 'claimed';`;

        const result = await this.dbService.query(query);
        return result[0].totalSharesGiven || 0;
    }

    async getTargetCPA(): Promise<number> {
        const query = `SELECT config_value FROM app_config WHERE config_key = 'target_CPA';`;
        const result = await this.dbService.query(query);
        
        if (result.length === 0) {
            throw new Error('Target CPA not defined in the database table app_config.');
        }

        const targetCPA = parseFloat(result[0].config_value);
        return targetCPA;
    }

    async adjustAssetSelectionUsingCPA(eligibleAssets: Asset[]) {
        const assetsWithPrices = await Promise.all(eligibleAssets.map(async (asset) => {
            const priceInfo = await Broker.getLatestPrice(asset.tickerSymbol);
            return { ...asset, price: priceInfo.sharePrice };
        }));

        const targetCPA = await this.getTargetCPA();
        const currentAverageCPA: number = await this.getCurrentCPA();
        if (currentAverageCPA > targetCPA) {
            // Prefer cheaper assets
            return assetsWithPrices.filter(asset => asset.price < targetCPA);
        } else if (currentAverageCPA < targetCPA) {
            // Prefer more expensive assets
            return assetsWithPrices.filter(asset => asset.price > targetCPA);
        }
        return assetsWithPrices;
    }
}
