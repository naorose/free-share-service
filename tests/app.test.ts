import { AssetSelector } from '../utilities/AssetSelector';
import Broker from '../services/Broker';
import { Asset } from '../models/Asset';

jest.mock('../services/Broker');

const MIN_SHARE_VALUE = 3;
const MAX_SHARE_VALUE = 200;

const TIER_1_MAX_VALUE = 200;
const TIER_2_MAX_VALUE = 25;
const TIER_3_MAX_VALUE = 10;

type TickerSymbol = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';

const mockAssets: Asset[] = [
    {tickerSymbol: 'A'}, 
    {tickerSymbol: 'B'}, 
    {tickerSymbol: 'C'}, 
    {tickerSymbol: 'D'}, 
    {tickerSymbol: 'E'}, 
    {tickerSymbol: 'F'}, 
    {tickerSymbol: 'G'}, 
    {tickerSymbol: 'H'}, 
    {tickerSymbol: 'I'}, 
    {tickerSymbol: 'J'}
]

// Mock prices corresponding to the ticker symbols
const mockPrices: Record<TickerSymbol, number> = {
    'A': 5,
    'B': 15,
    'C': 50,
    'D': 8,
    'E': 22,
    'F': 150,
    'G': 3,
    'H': 12,
    'I': 80,
    'J': 10,
};

// Mock implementation for Broker.getLatestPrice
Broker.getLatestPrice = jest.fn((tickerSymbol: string) => {
    if (typeof mockPrices[tickerSymbol as TickerSymbol] === 'undefined') {
        return Promise.reject(new Error('Invalid ticker symbol'));
    }
    return Promise.resolve({ sharePrice: mockPrices[tickerSymbol as TickerSymbol] });
});

describe('AssetDistribution', () => {
    let assetSelector: AssetSelector;

    beforeEach(() => {
        assetSelector = new AssetSelector(MIN_SHARE_VALUE, MAX_SHARE_VALUE);
    });

    const getAssetPrice = async (tickerSymbol: string) => {
        const priceInfo = await Broker.getLatestPrice(tickerSymbol);
        return priceInfo.sharePrice;
    };

    // Utility function to asynchronously filter assets
    const filterAssets = async (minPrice: number = MIN_SHARE_VALUE, maxPrice: number = MAX_SHARE_VALUE) => {
        const assetPrices = await Promise.all(mockAssets.map(async asset => ({
            asset,
            price: await getAssetPrice(asset.tickerSymbol)
        })));
        return assetPrices.filter(({ price }) => price >= minPrice && price <= maxPrice).map(({ asset }) => asset);
    };

    it('should select an asset from the top tier', async () => {
        global.Math.random = jest.fn(() => 0.99);
        const selectedAsset = await assetSelector.selectAsset(mockAssets);
        const price = await getAssetPrice(selectedAsset.tickerSymbol);
        expect(price).toBeGreaterThanOrEqual(TIER_2_MAX_VALUE);
        expect(price).toBeLessThanOrEqual(TIER_1_MAX_VALUE);
    });

    it('should select an asset from the middle tier', async () => {
        global.Math.random = jest.fn(() => 0.96);
        const selectedAsset = await assetSelector.selectAsset(mockAssets);
        const price = await getAssetPrice(selectedAsset.tickerSymbol);
        expect(price).toBeGreaterThanOrEqual(TIER_3_MAX_VALUE);
        expect(price).toBeLessThanOrEqual(TIER_2_MAX_VALUE);
    });

    it('should select an asset from the bottom tier', async () => {
        global.Math.random = jest.fn(() => 0.5);
        const selectedAsset = await assetSelector.selectAsset(mockAssets);
        const price = await getAssetPrice(selectedAsset.tickerSymbol);
        expect(price).toBeGreaterThanOrEqual(3);
        expect(price).toBeLessThanOrEqual(TIER_3_MAX_VALUE);
    });

    it('should select from the bottom tier if the top tier is empty', async () => {
        global.Math.random = jest.fn(() => 0.99); // Probability for top tier
        const filteredAssets = await filterAssets(MIN_SHARE_VALUE, TIER_2_MAX_VALUE); // Remove top tier assets
        const selectedAsset = await assetSelector.selectAsset(filteredAssets);
        const price = await getAssetPrice(selectedAsset.tickerSymbol);
        expect(price).toBeLessThanOrEqual(TIER_3_MAX_VALUE);
    });

    it('should throw an error if the bottom tier is empty', async () => {
        global.Math.random = jest.fn(() => 0.5); // Probability for bottom tier
        const filteredAssets = await filterAssets(TIER_2_MAX_VALUE) // Remove top tier assets
        await expect(assetSelector.selectAsset(filteredAssets)).rejects.toThrow('No assets available in the bottom tier.');
    });

    it('should select an asset based on the defined probability distribution', async () => {
        // Randomly simulate 100 selections and count tier distributions
        let bottomTierCount = 0, middleTierCount = 0, topTierCount = 0;
        for (let i = 0; i < 100; i++) {
            const selectedAsset = await assetSelector.selectAsset(mockAssets);
            const price = await getAssetPrice(selectedAsset.tickerSymbol);
            if (price <= TIER_3_MAX_VALUE) bottomTierCount++;
            else if (price <= TIER_2_MAX_VALUE) middleTierCount++;
            else topTierCount++;
        }
        // Expect majority of selections in the bottom tier based on the probability
        expect(bottomTierCount).toBeGreaterThan(middleTierCount + topTierCount);
    });

    it('should select an asset when the price range is very narrow', async () => {
        // Set minShareValue and maxShareValue to the same value to create a narrow price range
        const assetSelector = new AssetSelector(TIER_3_MAX_VALUE, TIER_3_MAX_VALUE);
        global.Math.random = jest.fn(() => 0.5); // Probability within the narrow price range
        const selectedAsset = await assetSelector.selectAsset(mockAssets);
        const price = await getAssetPrice(selectedAsset.tickerSymbol);
        expect(price).toEqual(TIER_3_MAX_VALUE);
    });

    it('should throw an error when the list of assets is empty', async () => {
        const assetSelector = new AssetSelector(TIER_3_MAX_VALUE, 100);
        await expect(assetSelector.selectAsset([])).rejects.toThrow('No assets available within the specified price range.');
    });
});