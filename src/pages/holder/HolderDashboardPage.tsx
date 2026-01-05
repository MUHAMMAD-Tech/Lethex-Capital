// LETHEX Holder Dashboard Page (FINAL CLEAN VERSION)

import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, Clock } from 'lucide-react';

import { fixPortfolioSync } from '@/fixes/fixPortfolioSync';
import { useAppStore } from '@/store/appStore';
import { getTransactionsByHolderId } from '@/db/api';

import type { TransactionWithDetails } from '@/types/types';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function HolderDashboardPage() {
  const { currentHolder, assets, prices } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithDetails[]>([]);
  const [totalValueUSDT, setTotalValueUSDT] = useState(0);
  const [totalValueKGS, setTotalValueKGS] = useState(0);

  // 🔄 Initial load
  useEffect(() => {
    if (!currentHolder) return;

    const init = async () => {
      setLoading(true);
      await fixPortfolioSync(); // 🔥 ASSETS STORE SYNC
      await loadTransactions();
      setLoading(false);
    };

    init();
  }, [currentHolder]);

  // 🔁 Recalculate when prices or assets change
  useEffect(() => {
    if (assets.length && Object.keys(prices).length) {
      calculatePortfolioValue();
    }
  }, [assets, prices]);

  // 📜 Transactions
  const loadTransactions = async () => {
    if (!currentHolder) return;

    try {
      const txs = await getTransactionsByHolderId(currentHolder.id);
      setRecentTransactions(txs.slice(0, 5));
    } catch (error) {
      console.error('❌ Transactions error:', error);
    }
  };

  // 💰 Portfolio value
  const calculatePortfolioValue = () => {
    let usdt = 0;
    let kgs = 0;

    for (const asset of assets) {
      const price = prices[asset.token_symbol.toLowerCase()];
      if (!price) continue;

      const amount =
        typeof asset.amount === 'string'
          ? parseFloat(asset.amount)
          : asset.amount;

      usdt += amount * price.price_usdt;
      kgs += amount * price.price_kgs;
    }

    setTotalValueUSDT(usdt);
    setTotalValueKGS(kgs);
  };

  const stats = [
    {
      title: 'Total Assets',
      value: assets.length,
      icon: Wallet,
      color: 'text-primary',
    },
    {
      title: 'Portfolio Value (USDT)',
      value: `$${totalValueUSDT.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      title: 'Portfolio Value (KGS)',
      value: `${totalValueKGS.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} KGS`,
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      title: 'Pending Requests',
      value: recentTransactions.filter(tx => tx.status === 'pending').length,
      icon: Clock,
      color: 'text-warning',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl xl:text-4xl font-bold">
          Welcome, {currentHolder?.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Your digital asset portfolio overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 @md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl xl:text-3xl font-bold">
                  {stat.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
            <a
              href="/holder/portfolio"
              className="p-4 rounded-lg bg-secondary/50 hover:bg-accent text-center"
            >
              <Wallet className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">View Portfolio</p>
              <p className="text-sm text-muted-foreground">
                See all your assets
              </p>
            </a>

            <a
              href="/holder/transactions"
              className="p-4 rounded-lg bg-secondary/50 hover:bg-accent text-center"
            >
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">New Transaction</p>
              <p className="text-sm text-muted-foreground">
                Swap, buy, or sell
              </p>
            </a>

            <a
              href="/holder/history"
              className="p-4 rounded-lg bg-secondary/50 hover:bg-accent text-center"
            >
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">View History</p>
              <p className="text-sm text-muted-foreground">
                Transaction history
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}