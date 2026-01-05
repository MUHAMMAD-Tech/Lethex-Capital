import { useAppStore } from '@/store/appStore';
import { getAssetsByHolderId } from '@/db/api';

export async function fixPortfolioSync() {
  const store = useAppStore.getState();
  const holder = store.currentHolder;

  if (!holder) {
    console.warn('❌ fixPortfolioSync: holder yo‘q');
    return;
  }

  try {
    const assets = await getAssetsByHolderId(holder.id);

    // 🔥 MAJBURIY STORE GA UZATISH
    useAppStore.setState({ assets });

    // 🔥 MAJBURIY HISOB
    store.calculatePortfolioValue();

    console.log('✅ fixPortfolioSync OK:', assets.length);
  } catch (e) {
    console.error('❌ fixPortfolioSync error:', e);
  }
}