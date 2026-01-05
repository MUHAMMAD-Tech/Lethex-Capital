// LETHEX Global State Store - Zustand
import { create } from 'zustand';
import type { TokenWhitelist, Holder, PriceCache } from '@/types/types';
import { getAllTokens } from '@/db/api';
import { priceService } from '@/services/priceService';

interface AppState {
  // Token data
  tokens: TokenWhitelist[];
  prices: PriceCache;
  pricesLoading: boolean;

  // Holder
  currentHolder: Holder | null;

  // Holder assets
  assets: any[];

  // Calculated portfolio values
  totalValueUSDT: number;
  totalValueKGS: number;

  // Actions
  loadTokens: () => Promise<void>;
  updatePrices: () => Promise<void>;

  setAssets: (assets: any[]) => void;
  calculatePortfolioValue: () => void;

  setCurrentHolder: (holder: Holder | null) => void;
  clearCurrentHolder: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  tokens: [],
  prices: {},
  pricesLoading: false,

  currentHolder: null,
  assets: [],

  totalValueUSDT: 0,
  totalValueKGS: 0,

  // Load all tokens
  loadTokens: async () => {
    const tokens = await getAllTokens();
    set({ tokens });
  },

  // Update prices from CoinGecko
  updatePrices: async () => {
    const { tokens, pricesLoading } = get();

    if (pricesLoading || tokens.length === 0) return;

    set({ pricesLoading: true });

    try {
      const coingeckoIds = tokens.map(t => t.coingecko_id);
      const priceData = await priceService.fetchPrices(coingeckoIds);

      const prices: PriceCache = {};
      for (const token of tokens) {
        const priceInfo = priceData[token.coingecko_id];
        if (priceInfo) {
          prices[token.symbol.toLowerCase()] = {
            ...priceInfo,
            symbol: token.symbol,
          };
        }
      }

      set({ prices, pricesLoading: false });

      // 🔥 MUHIM: narx yangilanganda qayta hisoblash
      get().calculatePortfolioValue();

    } catch (error) {
      console.error('Error updating prices:', error);
      set({ pricesLoading: false });
    }
  },

  // Set assets & auto-calc
  setAssets: (assets) => {
    set({ assets });
    get().calculatePortfolioValue();
  },

  // Calculate portfolio value
  calculatePortfolioValue: () => {
    const { assets, prices } = get();

    if (!assets.length || !Object.keys(prices).length) return;

    let totalUSDT = 0;
    let totalKGS = 0;

    for (const asset of assets) {
      const symbol = asset.token_symbol?.toLowerCase();
      const price = prices[symbol];
      if (!price) continue;

      const amount = Number(asset.amount);
      if (isNaN(amount)) continue;

      totalUSDT += amount * price.price_usdt;
      totalKGS += amount * price.price_kgs;
    }

    set({
      totalValueUSDT: totalUSDT,
      totalValueKGS: totalKGS,
    });
  },

  // Holder
  setCurrentHolder: (holder) => {
    set({ currentHolder: holder });
    if (holder) {
      sessionStorage.setItem('lethex_holder', JSON.stringify(holder));
    } else {
      sessionStorage.removeItem('lethex_holder');
    }
  },

  clearCurrentHolder: () => {
    set({ currentHolder: null, assets: [] });
    sessionStorage.removeItem('lethex_holder');
  },
}));

// Restore holder from sessionStorage
const storedHolder = sessionStorage.getItem('lethex_holder');
if (storedHolder) {
  try {
    const holder = JSON.parse(storedHolder);
    useAppStore.setState({ currentHolder: holder });
  } catch {
    sessionStorage.removeItem('lethex_holder');
  }
}