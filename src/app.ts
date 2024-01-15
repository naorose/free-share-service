import express from 'express';
import { AssetSelector } from '../utilities/AssetSelector';
import Broker from '../services/Broker';
import { UserService } from '../services/UserService';
import { DatabaseService } from '../services/DatabaseService';
import { QueueService } from '../services/QueueService';
import { QueuedTrade } from '../models/QueuedTrade';

const app = express();
app.use(express.json());

const PRICE_FLUCTUATION_THRESHOLD = parseFloat(process.env.PRICE_FLUCTUATION_THRESHOLD || '0.5');

const MIN_SHARE_VALUE = parseInt((process.env.MIN_SHARE_VALUE || '3'), 10);
const MAX_SHARE_VALUE = parseInt((process.env.MAX_SHARE_VALUE || '200'), 10);

const userService = new UserService();
const dbService = new DatabaseService();
const queueService = new QueueService(dbService);
const assetDistribution = new AssetSelector(MIN_SHARE_VALUE, MAX_SHARE_VALUE);

app.post('/claim-free-share', async (req, res) => {
    try {
        const accountId = req.body.accountId;

        // Check if user exists
        if (!(await userService.doesUserExist(accountId))) {
            return res.status(400).json({ message: `Invalid account ID provided (${accountId}).` });
        }

        // Check if the user is a new customer
        if (!(await userService.isNewCustomer(accountId))) {
            return res.status(403).json({ message: `User ${accountId} is not a new customer.` });
        }

        // Check if the user's account is verified
        if (!(await userService.isVerified(accountId))) {
            return res.status(401).json({ message: `User ${accountId} needs verification before trading.` });
        }

        // Check if user has already claimed their one free share
        if (await userService.hasUserAlreadyClaimedShare(accountId)) {
            return res.status(400).json({ message: `User ${accountId} has already claimed their one free share.` });
        }

        const assets = await Broker.listTradableAssets();
        const selectedAsset = await assetDistribution.selectAsset(assets);
        const selectedAssetPriceInfo = await Broker.getLatestPrice(selectedAsset.tickerSymbol);
        if (!selectedAsset) {
            return res.status(500).json({ message: 'No suitable assets available. Please try again later' });
        }

        // Handle trades during closed market hours
        const marketStatus = await Broker.isMarketOpen();
        if (!marketStatus.open) {
            const queuedTrade = new QueuedTrade(accountId, selectedAsset.tickerSymbol, new Date());
            queueService.addToQueue(queuedTrade);
            return res.status(200).json({
                message: `Order queued. Market is currently closed. Will process at next opening time: ${marketStatus.nextOpeningTime}`
            });
        }

        // Check for price fluctuations (simplified)
        const currentPriceInfo = await Broker.getLatestPrice(selectedAsset.tickerSymbol);
        if (Math.abs(currentPriceInfo.sharePrice - selectedAssetPriceInfo.sharePrice) > PRICE_FLUCTUATION_THRESHOLD) {
            return res.status(409).json({ message: 'The price of the stock has fluctuated beyond the acceptable threshold.' });
        }

        // Check for delisting before placing the order
        const tradableAssets = await Broker.listTradableAssets();
        const isAssetListed = tradableAssets.some(asset => asset.tickerSymbol === selectedAsset.tickerSymbol);
        if (!isAssetListed) {
            return res.status(400).json({ message: 'The selected stock is no longer listed.' });
        }

        // Place order
        const orderId = await Broker.placeBuyOrderUsingEmmaFunds(accountId, selectedAsset.tickerSymbol, 1);
        if (orderId !== null) {
            userService.setUserClaimedStatus(accountId);
        }

        res.json({ selectedStock: selectedAsset, orderDetails: orderId });
    } catch (error) {
        console.error('Error in /claim-free-share endpoint:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});