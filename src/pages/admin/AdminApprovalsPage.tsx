// LETHEX Admin Approvals Page - Transaction Request Management
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, ArrowRightLeft, ShoppingCart, DollarSign } from 'lucide-react';
import { getPendingTransactions, approveTransaction, rejectTransaction } from '@/db/api';
import { useI18n } from '@/contexts/I18nContext';
import type { TransactionWithDetails } from '@/types/types';

const POLL_INTERVAL = 3000; // 3 seconds

export default function AdminApprovalsPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithDetails | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [executionPrice, setExecutionPrice] = useState('');
  const [processing, setProcessing] = useState(false);

  // Load pending transactions
  const loadTransactions = async () => {
    const data = await getPendingTransactions();
    setTransactions(data);
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    loadTransactions();
  }, []);

  // Polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadTransactions();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const openApproveDialog = (transaction: TransactionWithDetails) => {
    setSelectedTransaction(transaction);
    setExecutionPrice('');
    setShowApproveDialog(true);
  };

  const handleApprove = async () => {
    if (!selectedTransaction) return;

    // Validate execution price for swap transactions
    if (selectedTransaction.transaction_type === 'swap') {
      if (!executionPrice || parseFloat(executionPrice) <= 0) {
        toast.error('Please enter a valid execution price');
        return;
      }
    }

    setProcessing(true);

    const result = await approveTransaction(
      selectedTransaction.id,
      'admin', // In a real system, this would be the actual admin user ID
      selectedTransaction.transaction_type === 'swap' ? executionPrice : undefined
    );

    setProcessing(false);

    if (result.success) {
      toast.success('Transaction approved successfully');
      setShowApproveDialog(false);
      setSelectedTransaction(null);
      setExecutionPrice('');
      loadTransactions();
    } else {
      toast.error(result.error || 'Failed to approve transaction');
    }
  };

  const handleReject = async (transaction: TransactionWithDetails) => {
    setProcessing(true);

    const success = await rejectTransaction(
      transaction.id,
      'admin' // In a real system, this would be the actual admin user ID
    );

    setProcessing(false);

    if (success) {
      toast.success('Transaction rejected');
      loadTransactions();
    } else {
      toast.error('Failed to reject transaction');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'swap':
        return <ArrowRightLeft className="h-5 w-5" />;
      case 'buy':
        return <ShoppingCart className="h-5 w-5" />;
      case 'sell':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col @md:flex-row @md:items-center @md:justify-between gap-4">
        <div>
          <h1 className="text-3xl xl:text-4xl font-bold text-foreground">
            {t('admin.approvals')}
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and approve pending transaction requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            {transactions.length} Pending
          </Badge>
        </div>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Pending Requests
              </h3>
              <p className="text-muted-foreground">
                All transaction requests have been processed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col @md:flex-row @md:items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {/* Icon & Type */}
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground capitalize">
                        {transaction.transaction_type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.holder?.name || 'Unknown Holder'}
                      </p>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 grid grid-cols-1 @md:grid-cols-2 gap-2">
                    {transaction.transaction_type === 'swap' && (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground">From</p>
                          <p className="text-sm font-medium">
                            {transaction.amount} {transaction.from_token}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">To</p>
                          <p className="text-sm font-medium">{transaction.to_token}</p>
                        </div>
                      </>
                    )}
                    {transaction.transaction_type === 'buy' && (
                      <div>
                        <p className="text-xs text-muted-foreground">Token</p>
                        <p className="text-sm font-medium">
                          {transaction.amount} {transaction.to_token}
                        </p>
                      </div>
                    )}
                    {transaction.transaction_type === 'sell' && (
                      <div>
                        <p className="text-xs text-muted-foreground">Token</p>
                        <p className="text-sm font-medium">
                          {transaction.amount} {transaction.from_token}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Fee</p>
                      <p className="text-sm font-medium">{transaction.fee}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Requested</p>
                      <p className="text-sm font-medium">
                        {formatDate(transaction.requested_at)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => openApproveDialog(transaction)}
                      disabled={processing}
                      className="bg-success hover:bg-success/90"
                    >
                      <CheckCircle className="h-4 w-4 @md:mr-2" />
                      <span className="hidden @md:inline">Approve</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(transaction)}
                      disabled={processing}
                      className="text-destructive hover:text-destructive"
                    >
                      <XCircle className="h-4 w-4 @md:mr-2" />
                      <span className="hidden @md:inline">Reject</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Transaction</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.transaction_type === 'swap'
                ? 'Enter the execution price to complete the swap transaction.'
                : 'Confirm approval of this transaction request.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Transaction Summary */}
            <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Holder</span>
                <span className="text-sm font-medium">
                  {selectedTransaction?.holder?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="text-sm font-medium capitalize">
                  {selectedTransaction?.transaction_type}
                </span>
              </div>
              {selectedTransaction?.transaction_type === 'swap' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">From</span>
                    <span className="text-sm font-medium">
                      {selectedTransaction?.amount} {selectedTransaction?.from_token}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">To</span>
                    <span className="text-sm font-medium">
                      {selectedTransaction?.to_token}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Net Amount</span>
                    <span className="text-sm font-medium">
                      {selectedTransaction?.net_amount}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fee</span>
                <span className="text-sm font-medium">{selectedTransaction?.fee}</span>
              </div>
            </div>

            {/* Execution Price Input (for swap only) */}
            {selectedTransaction?.transaction_type === 'swap' && (
              <div className="space-y-2">
                <Label htmlFor="execution-price">
                  Execution Price (1 {selectedTransaction?.from_token} = ? {selectedTransaction?.to_token})
                </Label>
                <Input
                  id="execution-price"
                  type="number"
                  step="0.00000001"
                  placeholder="Enter execution price"
                  value={executionPrice}
                  onChange={(e) => setExecutionPrice(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The holder will receive approximately{' '}
                  {executionPrice && selectedTransaction?.net_amount
                    ? (
                        parseFloat(selectedTransaction.net_amount) *
                        parseFloat(executionPrice)
                      ).toFixed(8)
                    : '0'}{' '}
                  {selectedTransaction?.to_token}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(false)}
                className="flex-1"
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                className="flex-1 bg-success hover:bg-success/90"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Confirm Approval'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
