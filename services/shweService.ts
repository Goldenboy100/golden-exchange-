
import { CurrencyRate, MetalRate } from '../types';

/**
 * Service to handle synchronization with SHWE app data.
 * Note: SHWE does not provide a public API. This service is a template
 * that can be configured with a real endpoint if available.
 */
export const shweService = {
  /**
   * Fetches the latest rates from SHWE (Mock implementation)
   * In a real scenario, this would call a SHWE API endpoint.
   */
  async fetchRates(): Promise<{ rates: Partial<CurrencyRate>[], metals: Partial<MetalRate>[] }> {
    // This is a placeholder for the real SHWE API call
    // Example: const response = await fetch('https://api.shwe.krd/v1/rates');
    
    // Base price simulation (approximate current market)
    // In a real app, this would be fetched from a backend or scraped
    const baseUSD = 151250;
    const variation = () => Math.floor(Math.random() * 50) * 10; // Random variation

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          rates: [
            // Local Markets (Sorted by importance/SHWE order)
            // Baghdad is usually the base price
            { name: 'دۆلار - بەغدا', code: 'USD/IQD', buy: baseUSD, sell: baseUSD + 500, category: 'local', flag: 'https://flagcdn.com/w80/iq.png' },
            // Erbil is typically higher than Baghdad
            { name: 'دۆلار - هەولێر', code: 'USD/IQD', buy: baseUSD + 250, sell: baseUSD + 750, category: 'local', flag: 'https://flagcdn.com/w80/iq.png' },
            // Sulaymaniyah is typically slightly higher than Baghdad but lower than Erbil
            { name: 'دۆلار - سلێمانی', code: 'USD/IQD', buy: baseUSD + 150, sell: baseUSD + 650, category: 'local', flag: 'https://flagcdn.com/w80/iq.png' },
            // Duhok is similar to Erbil
            { name: 'دۆلار - دهۆک', code: 'USD/IQD', buy: baseUSD + 250, sell: baseUSD + 750, category: 'local', flag: 'https://flagcdn.com/w80/iq.png' },
            // Kirkuk is close to Baghdad
            { name: 'دۆلار - کەرکووک', code: 'USD/IQD', buy: baseUSD + 50, sell: baseUSD + 550, category: 'local', flag: 'https://flagcdn.com/w80/iq.png' },
            // Najaf is close to Baghdad
            { name: 'دۆلار - نەجەف', code: 'USD/IQD', buy: baseUSD, sell: baseUSD + 500, category: 'local', flag: 'https://flagcdn.com/w80/iq.png' },
            // Mosul is close to Baghdad/Kirkuk
            { name: 'دۆلار - مووسڵ', code: 'USD/IQD', buy: baseUSD + 50, sell: baseUSD + 550, category: 'local', flag: 'https://flagcdn.com/w80/iq.png' },
            // Basra is close to Baghdad
            { name: 'دۆلار - بەسرە', code: 'USD/IQD', buy: baseUSD + 50, sell: baseUSD + 550, category: 'local', flag: 'https://flagcdn.com/w80/iq.png' },
            
            // Toman
            { name: 'تمەن بۆ دینار (ملیۆن)', code: 'IRR/IQD', buy: 22100, sell: 22600, category: 'toman', flag: 'https://flagcdn.com/w80/ir.png' },
            { name: 'تمەن - تاران', code: 'USD/IRR', buy: 68500, sell: 69500, category: 'toman', flag: 'https://flagcdn.com/w80/ir.png' },
            
            // Global
            { name: 'یۆرۆ بۆ دینار', code: 'EUR/IQD', buy: 161250, sell: 162750, category: 'global', flag: 'https://flagcdn.com/w80/eu.png' },
            { name: 'پاوەند بۆ دینار', code: 'GBP/IQD', buy: 191000, sell: 192500, category: 'global', flag: 'https://flagcdn.com/w80/gb.png' },
            { name: 'لیرەی تورکی بۆ دینار', code: 'TRY/IQD', buy: 4400, sell: 4600, category: 'global', flag: 'https://flagcdn.com/w80/tr.png' },
            { name: 'درهەمی ئیماراتی بۆ دینار', code: 'AED/IQD', buy: 41150, sell: 41650, category: 'global', flag: 'https://flagcdn.com/w80/ae.png' },
            { name: 'ڕیاڵی سعوودی بۆ دینار', code: 'SAR/IQD', buy: 40300, sell: 40800, category: 'global', flag: 'https://flagcdn.com/w80/sa.png' },
            { name: 'دیناری کوەیتی بۆ دینار', code: 'KWD/IQD', buy: 492000, sell: 497000, category: 'global', flag: 'https://flagcdn.com/w80/kw.png' },
          ],
          metals: [
            { name: 'زێڕی ٢٤ عەیار', code: '24K', buy: 565000, sell: 575000, category: 'gold', unit: 'Mithqal', icon: 'https://cdn-icons-png.flaticon.com/512/2415/2415255.png' },
            { name: 'زێڕی ٢١ عەیار', code: '21K', buy: 495000, sell: 505000, category: 'gold', unit: 'Mithqal', icon: 'https://cdn-icons-png.flaticon.com/512/2415/2415255.png' },
            { name: 'زێڕی ١٨ عەیار', code: '18K', buy: 425000, sell: 435000, category: 'gold', unit: 'Mithqal', icon: 'https://cdn-icons-png.flaticon.com/512/2415/2415255.png' },
            { name: 'زیو', code: 'Silver', buy: 12500, sell: 13500, category: 'silver', unit: 'Ounce', icon: 'https://cdn-icons-png.flaticon.com/512/2415/2415255.png' },
          ]
        });
      }, 500); // Faster response
    });
  }
};
