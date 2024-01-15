import Broker from './Broker';
import { DatabaseService } from './DatabaseService';

export class UserService {
    private dbService: DatabaseService;

    constructor() {
        this.dbService = new DatabaseService();
    }

    async isNewCustomer(accountId: string): Promise<boolean> {
        return !this.hasPurchasedShares(accountId) && !this.hasFilledOrders(accountId);
    }

    async doesUserExist(accountId: string): Promise<boolean> {
        const query = `SELECT * FROM users WHERE accountId = ? AND status = 'active';`;
        const user = await this.dbService.query(query, [accountId]);
        return user.length > 0;
    }

    async isVerified(accountId: string): Promise<boolean> {
        const query = `SELECT * FROM users WHERE accountId = ? AND isVerified = TRUE;`;
        const user = await this.dbService.query(query, [accountId]);
        return user.length > 0;
    }

    async hasUserAlreadyClaimedShare(accountId: string): Promise<boolean> {
        const query = `SELECT * FROM users WHERE accountId = ? AND free_share_status = 'claimed';`;
        const user = await this.dbService.query(query, [accountId]);
        return user.length > 0;
    }

    async setUserClaimedStatus(accountId: string): Promise<void> {
        const updateQuery = `UPDATE users SET free_share_status = 'claimed' WHERE accountId = ?;`;
        await this.dbService.execute(updateQuery, [accountId]);
    }

    async hasPurchasedShares(accountId: string): Promise<boolean> {
        const positions = await Broker.getAccountPositions(accountId);
        return positions.length > 0;
    }

    async hasFilledOrders(accountId: string): Promise<boolean> {
        const orders = await Broker.getAllOrders(accountId);
        const filledOrders = orders.filter(order => order.status === 'filled');
        return filledOrders.length > 0;
    }
}