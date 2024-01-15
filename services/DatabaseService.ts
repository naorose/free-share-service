import 'dotenv/config';
import mysql from 'mysql2/promise';

export class DatabaseService {
    private pool: mysql.Pool;

    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: process.env.DB_CONN_LIMIT ? parseInt(process.env.DB_CONN_LIMIT) : 10,
        });
    }

    async query(sql: string, params: any[] = []): Promise<any> {
        const [results] = await this.pool.query(sql, params);
        return results;
    }

    async execute(sql: string, params: any[] = []): Promise<void> {
        await this.pool.execute(sql, params);
    }
}