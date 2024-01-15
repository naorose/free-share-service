import Broker from "../services/Broker";
import { Asset } from "../models/Asset";
import { AssetTier } from "../models/AssetTier";
import { CPAService } from "../services/CPAService";

export class AssetSelector {
    private minShareValue: number;
    private maxShareValue: number;
    
    private readonly tierProbabilities: AssetTier[] = [
        { minValue: 3,  maxValue: 10,  probabilityOfSelection: 0.95 },
        { minValue: 10, maxValue: 25,  probabilityOfSelection: 0.03 },
        { minValue: 25, maxValue: 200, probabilityOfSelection: 0.02 }
    ];

    constructor(minShareValue: number, maxShareValue: number) {
        this.minShareValue = minShareValue;
        this.maxShareValue = maxShareValue;
    }

    async selectAsset(assets: Asset[], usingCPA: boolean = false): Promise<Asset> {
        if (usingCPA) {
            return this.selectAssetBasedOnCPA(assets);
        } else {
            return this.selectAssetBasedOnProbability(assets);
        }
        
    }

    private async selectAssetBasedOnProbability(assets: Asset[]): Promise<Asset> {
        const assetsWithPrices = await Promise.all(assets.map(async (asset) => {
            const priceInfo = await Broker.getLatestPrice(asset.tickerSymbol);
            return { ...asset, price: priceInfo.sharePrice };
        }));

        const eligibleAssets = assetsWithPrices.filter(asset =>
            asset.price >= this.minShareValue && asset.price <= this.maxShareValue
        );

        if (!eligibleAssets.length) {
            throw new Error('No assets available within the specified price range.');
        }

        const randomSelection = Math.random();
        let accumulatedProbability = 0;
        let selectedTier = this.tierProbabilities.find(tier => {
            accumulatedProbability += tier.probabilityOfSelection;
            return randomSelection <= accumulatedProbability;
        }) || this.tierProbabilities[0];

        let assetsInTier = eligibleAssets.filter(asset =>
            asset.price >= selectedTier.minValue && asset.price <= selectedTier.maxValue);

        // If the selected tier is empty, try to select from the next lower tier
        while (assetsInTier.length === 0) {
            const nextTierIndex = this.tierProbabilities.indexOf(selectedTier) - 1;
            if (nextTierIndex < 0) {
                // If there are no more tiers to check, throw an error
                throw new Error('No assets available in the bottom tier.');
            }

            selectedTier = this.tierProbabilities[nextTierIndex];
            assetsInTier = eligibleAssets.filter(asset =>
                asset.price >= selectedTier.minValue && asset.price <= selectedTier.maxValue
            );

            // If the bottom tier is selected and empty, throw an error
            if (selectedTier.minValue === this.minShareValue && assetsInTier.length === 0) {
                throw new Error('No assets available in any tier.');
            }
        }

        // Select a random asset from the assets in the selected or adjusted tier
        return assetsInTier[Math.floor(Math.random() * assetsInTier.length)];
    }

    private async selectAssetBasedOnCPA(assets: Asset[]): Promise<Asset> {
        const cpaService = new CPAService();
        const adjustedAssets = await cpaService.adjustAssetSelectionUsingCPA(assets);
    
        if (adjustedAssets.length === 0) {
            throw new Error('No assets available after CPA adjustment.');
        }
    
        // Randomly select an asset from the adjusted list
        const randomIndex = Math.floor(Math.random() * adjustedAssets.length);
        return adjustedAssets[randomIndex];
    }
}
