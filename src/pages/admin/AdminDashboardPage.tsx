// LETHEX Admin Dashboard Page
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Wallet, Clock, DollarSign } from 'lucide-react';
import { getAllHolders, getPendingTransactions, getCommissionSummary } from '@/db/api';
import type { Holder, TransactionWithDetails } from '@/types/types';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<TransactionWithDetails[]>([]);
  const [totalCommissions, setTotalCommissions] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [holdersData, pendingData, commissionsData] = await Promise.all([
        getAllHolders(),
        getPendingTransactions(),
        getCommissionSummary(),
      ]);

      setHolders(holdersData);
      setPendingTransactions(pendingData);

      // Calculate total commissions
      if (commissionsData) {
        const total = commissionsData.reduce((sum, tx) => sum + parseFloat(tx.fee || '0'), 0);
        setTotalCommissions(total);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Holders',
      value: holders.length,
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Pending Approvals',
      value: pendingTransactions.length,
      icon: Clock,
      color: 'text-warning',
    },
    {
      title: 'Total Commissions',
      value: `$${totalCommissions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-success',
    },
    {
      title: 'Active Assets',
      value: '-',
      icon: Wallet,
      color: 'text-primary',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl xl:text-4xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your fund management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 @md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border bg-card card-glow-hover">
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Holders */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Holders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-muted" />
                ))}
              </div>
            ) : holders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No holders yet</p>
            ) : (
              <div className="space-y-3">
                {holders.slice(0, 5).map((holder) => (
                  <div
                    key={holder.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{holder.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {holder.email || 'No email'}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(holder.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-muted" />
                ))}
              </div>
            ) : pendingTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending approvals</p>
            ) : (
              <div className="space-y-3">
                {pendingTransactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {tx.transaction_type.toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tx.holder?.name || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {parseFloat(tx.amount).toFixed(4)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.from_token || tx.to_token}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
