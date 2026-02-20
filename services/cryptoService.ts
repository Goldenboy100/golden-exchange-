import { CryptoRate } from '../types';

const SYMBOLS_MAP: Record<string, string> = {
  'BTC': 'BTCUSDT',
  'ETH': 'ETHUSDT',
  'USDT': 'USDTUSDT', // Binance doesn't have USDT/USDT pair usually, handle separately
  'XRP': 'XRPUSDT',
  'SOL': 'SOLUSDT',
  'BNB': 'BNBUSDT',
  'ADA': 'ADAUSDT',
  'DOGE': 'DOGEUSDT',
  'TRX': 'TRXUSDT',
  'TON': 'TONUSDT',
  'LTC': 'LTCUSDT',
  'DOT': 'DOTUSDT'
};

export const cryptoService = {
  async fetchRates(): Promise<Partial<CryptoRate>[]> {
    try {
      const symbols = Object.values(SYMBOLS_MAP).filter(s => s !== 'USDTUSDT');
      // Binance allows multiple symbols in one call but it's complex URL encoding. 
      // Easier to fetch all tickers or just loop. Fetching all is heavy (~2MB).
      // Let's fetch individually or in small batches if needed, but for <10 items, individual is fine in parallel.
      
      const requests = symbols.map(symbol => 
        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
          .then(res => res.json())
          .catch(() => null)
      );

      const results = await Promise.all(requests);
      
      const updates: Partial<CryptoRate>[] = [];

      results.forEach((data, index) => {
        if (!data || data.code) return; // data.code means error from binance
        
        const symbolKey = Object.keys(SYMBOLS_MAP).find(key => SYMBOLS_MAP[key] === data.symbol);
        if (symbolKey) {
          updates.push({
            symbol: symbolKey,
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChangePercent),
            lastUpdated: new Date().toISOString()
          });
        }
      });

      // Handle USDT manually (always ~1.00)
      updates.push({
        symbol: 'USDT',
        price: 1.00,
        change24h: 0.01,
        lastUpdated: new Date().toISOString()
      });

      return updates;
    } catch (error) {
      console.error('Failed to fetch crypto rates', error);
      return [];
    }
  }
};
