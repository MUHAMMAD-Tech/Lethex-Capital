// LETHEX Token Selector Modal Component
import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TokenWhitelist } from '@/types/types';
import { useAppStore } from '@/store/appStore';

interface TokenSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (token: TokenWhitelist) => void;
  excludeSymbol?: string; // Exclude a token from the list (e.g., for swap from/to)
  title?: string;
}

export function TokenSelector({
  open,
  onOpenChange,
  onSelect,
  excludeSymbol,
  title = 'Select Asset',
}: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { tokens, prices } = useAppStore();

  // Filter tokens based on search query and exclusion
  const filteredTokens = useMemo(() => {
    let filtered = tokens;

    // Exclude specific token if provided
    if (excludeSymbol) {
      filtered = filtered.filter(t => t.symbol !== excludeSymbol);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.symbol.toLowerCase().includes(query) ||
          t.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [tokens, searchQuery, excludeSymbol]);

  const handleSelect = (token: TokenWhitelist) => {
    onSelect(token);
    onOpenChange(false);
    setSearchQuery(''); // Reset search on close
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Search Input - Sticky */}
        <div className="sticky top-0 z-10 bg-card pb-4">
          <Input
            placeholder="Search by name or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>

        {/* Token List - Scrollable */}
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-2">
            {filteredTokens.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No tokens found
              </div>
            ) : (
              filteredTokens.map((token) => {
                const price = prices[token.symbol];
                return (
                  <button
                    key={token.symbol}
                    onClick={() => handleSelect(token)}
                    type="button"
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {/* Token Logo */}
                      {token.logo_url ? (
                        <img
                          src={token.logo_url}
                          alt={token.symbol}
                          className="w-8 h-8 rounded-full"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                          {token.symbol.slice(0, 2)}
                        </div>
                      )}

                      {/* Token Info */}
                      <div>
                        <div className="font-bold text-foreground">
                          {token.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {token.name}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    {price && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          ${price.price_usdt.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6,
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {price.price_kgs.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} KGS
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
