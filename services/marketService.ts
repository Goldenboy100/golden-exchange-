
import { CurrencyRate, MetalRate } from '../types';

/**
 * Service to handle synchronization with Global Market (Borsa) data.
 */
export const marketService = {
  /**
   * Fetches the latest rates from Global Exchange (Borsa)
   */
  async fetchLiveMarketData(): Promise<{ rates: Partial<CurrencyRate>[], metals: Partial<MetalRate>[] }> {
    // Global Market Base Rates (USD)
    // These are simulated "Live" rates from a global source (Borsa)
    const globalSpot = {
      XAU: 2745.50 + (Math.random() - 0.5) * 5, // Gold Spot
      XAG: 34.65 + (Math.random() - 0.5) * 0.5,   // Silver Spot
      EUR: 1.052 + (Math.random() - 0.5) * 0.002,   // EUR/USD
      GBP: 1.265 + (Math.random() - 0.5) * 0.002,   // GBP/USD
      TRY: 0.028 + (Math.random() - 0.5) * 0.0001,   // TRY/USD
      AED: 0.272,   // AED/USD
      SAR: 0.266,   // SAR/USD
      KWD: 3.255,   // KWD/USD
      IQD_BASE: 151500 // Base Market Price for 100 USD in IQD
    };

    // Constants for calculation
    const OUNCE_TO_GRAM = 31.1035;
    const MITHQAL_TO_GRAM = 5;

    // Calculate Gold Prices per Mithqal (USD)
    // Formula: (Spot / 31.1034768) * 5 * (Purity)
    const calculateGoldMithqalUSD = (spot: number, purity: number) => {
      const OUNCE_TO_GRAM = 31.1034768;
      const MITHQAL_TO_GRAM = 5;
      const pricePerGramUSD = spot / OUNCE_TO_GRAM;
      const pricePerMithqalUSD = pricePerGramUSD * MITHQAL_TO_GRAM * purity;
      return Number(pricePerMithqalUSD.toFixed(2));
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          rates: [
            { name: 'دۆلار - بەغدا', code: 'USD/IQD', buy: globalSpot.IQD_BASE, sell: globalSpot.IQD_BASE + 500, category: 'local' },
            { name: 'یۆرۆ بۆ دینار', code: 'EUR/IQD', buy: Math.round(globalSpot.EUR * globalSpot.IQD_BASE), sell: Math.round(globalSpot.EUR * globalSpot.IQD_BASE) + 1500, category: 'global' },
            { name: 'پاوەند بۆ دینار', code: 'GBP/IQD', buy: Math.round(globalSpot.GBP * globalSpot.IQD_BASE), sell: Math.round(globalSpot.GBP * globalSpot.IQD_BASE) + 1500, category: 'global' },
            // Gold in USD per Mithqal for currency comparison
            { id: 'gold_usd_21', name: 'زێڕی عەیارە ٢١ (Mithqal)', code: '21K/USD', buy: calculateGoldMithqalUSD(globalSpot.XAU, 0.875), sell: calculateGoldMithqalUSD(globalSpot.XAU, 0.875) + 2, category: 'local', flag: 'https://cdn-icons-png.flaticon.com/512/2536/2536128.png' },
          ],
          metals: [
            // Global Bullion (USD)
            { name: 'ئۆنسەی زێڕ (Global Gold)', code: 'XAU/USD', buy: Number(globalSpot.XAU.toFixed(2)), sell: Number((globalSpot.XAU + 0.5).toFixed(2)), category: 'global', unit: '$' },
            { name: 'ئۆنسەی زیو (Global Silver)', code: 'XAG/USD', buy: Number(globalSpot.XAG.toFixed(2)), sell: Number((globalSpot.XAG + 0.1).toFixed(2)), category: 'global', unit: '$' },
          ]
        });
      }, 500);
    });
  }
};
