// LETHEX Holder Dashboard Page (STORE-BASED, FIXED)

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, TrendingUp, Clock } from 'lucide-react';

import { useAppStore } from '@/store/appStore';
import { fixPortfolioSync } from '@/fixes/fixPortfolioSync';
import { getTransactionsByHolderId } from '@/db/api';
import type { TransactionWithDetails } from '@/types/types';
import { useState } from 'react';

export default function HolderDashboardPage() {
  const {
    currentHolder,
    assets,
    totalValueUSDT,
    totalValueKGS,
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithDetails[]>([]);

  // 🔥 Holder o‘zgarsa → store majburan sync
  useEffect(() => {
    if (currentHolder) {
      fixPortfolioSync();
      loadTransactions();
    }
  }, [currentHolder]);

  const loadTransactions = async () => {
    if (!currentHolder) return;

    setLoading(true);
    try {
      const txs = await getTransactionsByHolderId(currentHolder.id);
      setRecentTransactions(txs.slice(0, 5));
    } catch (e) {
      console.error('❌ Transactions load error:', e);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl xl:text-4xl font-bold text-foreground">
          Welcome, {currentHolder?.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Your digital asset portfolio overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 @md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
        {stats.map(stat => (
          <Card key={stat.title} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24 bg-muted" />
              ) : (
                <div className="text-2xl xl:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
            <a
              href="/holder/portfolio"
              className="p-4 rounded-lg bg-secondary/50 hover:bg-accent transition-colors text-center"
            >
              <Wallet className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">View Portfolio</p>
              <p className="text-sm text-muted-foreground mt-1">
                See all your assets
              </p>
            </a>

            <a
              href="/holder/transactions"
              className="p-4 rounded-lg bg-secondary/50 hover:bg-accent transition-colors text-center"
            >
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">New Transaction</p>
              <p className="text-sm text-muted-foreground mt-1">
                Swap, buy, or sell
              </p>
            </a>

            <a
              href="/holder/history"
              className="p-4 rounded-lg bg-secondary/50 hover:bg-accent transition-colors text-center"
            >
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">View History</p>
              <p className="text-sm text-muted-foreground mt-1">
                Transaction history
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}