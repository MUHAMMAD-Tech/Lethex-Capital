// LETHEX API Service Layer - Supabase Database Operations
import { supabase } from './supabase';
import type {
  Profile,
  SystemSettings,
  TokenWhitelist,
  Holder,
  Asset,
  Transaction,
  AssetWithToken,
  TransactionWithDetails,
  HolderFormData,
  AssetFormData,
  TransactionType,
  TransactionStatus,
} from '@/types/types';

// ============================================================================
// PROFILES
// ============================================================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function updateProfileRole(userId: string, role: 'admin' | 'holder'): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile role:', error);
    return false;
  }
  return true;
}

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

export async function getSystemSettings(): Promise<SystemSettings | null> {
  try {
    console.log('getSystemSettings: Fetching from database...');
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.error('getSystemSettings: Error fetching system settings:', error);
      return null;
    }
    
    console.log('getSystemSettings: Data retrieved:', data);
    return data;
  } catch (error) {
    console.error('getSystemSettings: Exception caught:', error);
    return null;
  }
}

export async function updateAdminAccessCode(newCode: string): Promise<boolean> {
  const { error } = await supabase
    .from('system_settings')
    .update({ admin_access_code: newCode, updated_at: new Date().toISOString() })
    .eq('id', 1);

  if (error) {
    console.error('Error updating admin access code:', error);
    return false;
  }
  return true;
}

export async function verifyAdminAccessCode(code: string): Promise<boolean> {
  try {
    console.log('verifyAdminAccessCode called with code:', code);
    const settings = await getSystemSettings();
    console.log('System settings retrieved:', settings);
    
    if (!settings) {
      console.error('System settings is null');
      return false;
    }
    
    const isMatch = settings.admin_access_code === code;
    console.log('Code match result:', isMatch, 'Expected:', settings.admin_access_code, 'Got:', code);
    return isMatch;
  } catch (error) {
    console.error('Error in verifyAdminAccessCode:', error);
    return false;
  }
}

// ============================================================================
// TOKEN WHITELIST
// ============================================================================

export async function getAllTokens(): Promise<TokenWhitelist[]> {
  const { data, error } = await supabase
    .from('token_whitelist')
    .select('*')
    .order('symbol', { ascending: true });

  if (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getTokenBySymbol(symbol: string): Promise<TokenWhitelist | null> {
  const { data, error } = await supabase
    .from('token_whitelist')
    .select('*')
    .eq('symbol', symbol)
    .maybeSingle();

  if (error) {
    console.error('Error fetching token:', error);
    return null;
  }
  return data;
}

// ============================================================================
// HOLDERS
// ============================================================================

export async function getAllHolders(): Promise<Holder[]> {
  const { data, error } = await supabase
    .from('holders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching holders:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getHolderById(id: string): Promise<Holder | null> {
  const { data, error } = await supabase
    .from('holders')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching holder:', error);
    return null;
  }
  return data;
}

export async function getHolderByAccessCode(accessCode: string): Promise<Holder | null> {
  const { data, error } = await supabase
    .from('holders')
    .select('*')
    .eq('access_code', accessCode)
    .maybeSingle();

  if (error) {
    console.error('Error fetching holder by access code:', error);
    return null;
  }
  return data;
}

export async function createHolder(holderData: HolderFormData): Promise<Holder | null> {
  // Generate unique access code
  const accessCode = generateAccessCode();

  const { data, error } = await supabase
    .from('holders')
    .insert({
      name: holderData.name,
      email: holderData.email || null,
      phone: holderData.phone || null,
      access_code: accessCode,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating holder:', error);
    return null;
  }
  return data;
}

export async function updateHolder(id: string, holderData: Partial<HolderFormData>): Promise<boolean> {
  const { error } = await supabase
    .from('holders')
    .update({
      ...holderData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating holder:', error);
    return false;
  }
  return true;
}

export async function deleteHolder(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('holders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting holder:', error);
    return false;
  }
  return true;
}

// Helper function to generate unique access code
function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function updateHolderAccessCode(id: string, newAccessCode: string): Promise<boolean> {
  const { error } = await supabase
    .from('holders')
    .update({
      access_code: newAccessCode,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating holder access code:', error);
    return false;
  }
  return true;
}

export { generateAccessCode };

// ============================================================================
// ASSETS
// ============================================================================

export async function getAssetsByHolderId(holderId: string): Promise<AssetWithToken[]> {
  const { data, error } = await supabase
    .from('assets')
    .select(`
      *,
      token:token_whitelist!assets_token_symbol_fkey(*)
    `)
    .eq('holder_id', holderId)
    .order('token_symbol', { ascending: true });

  if (error) {
    console.error('Error fetching assets:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getAssetByHolderAndToken(holderId: string, tokenSymbol: string): Promise<Asset | null> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('holder_id', holderId)
    .eq('token_symbol', tokenSymbol)
    .maybeSingle();

  if (error) {
    console.error('Error fetching asset:', error);
    return null;
  }
  return data;
}

export async function createOrUpdateAsset(assetData: AssetFormData): Promise<boolean> {
  const { data, error } = await supabase
    .from('assets')
    .upsert({
      holder_id: assetData.holder_id,
      token_symbol: assetData.token_symbol,
      amount: assetData.amount,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'holder_id,token_symbol',
    })
    .select();

  if (error) {
    console.error('Error creating/updating asset:', error);
    return false;
  }
  return true;
}

export async function updateAssetAmount(holderId: string, tokenSymbol: string, newAmount: string): Promise<boolean> {
  const { error } = await supabase
    .from('assets')
    .update({
      amount: newAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('holder_id', holderId)
    .eq('token_symbol', tokenSymbol);

  if (error) {
    console.error('Error updating asset amount:', error);
    return false;
  }
  return true;
}

export async function deleteAsset(holderId: string, tokenSymbol: string): Promise<boolean> {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('holder_id', holderId)
    .eq('token_symbol', tokenSymbol);

  if (error) {
    console.error('Error deleting asset:', error);
    return false;
  }
  return true;
}

// Wrapper functions for simplified API
export async function getAssetsByHolder(holderId: string): Promise<Asset[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('holder_id', holderId)
    .order('token_symbol', { ascending: true });

  if (error) {
    console.error('Error fetching assets:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function createAsset(assetData: AssetFormData): Promise<boolean> {
  const { error } = await supabase
    .from('assets')
    .insert({
      holder_id: assetData.holder_id,
      token_symbol: assetData.token_symbol,
      amount: assetData.amount,
    });

  if (error) {
    console.error('Error creating asset:', error);
    return false;
  }
  return true;
}

export async function updateAsset(assetId: string, updates: { amount: number }): Promise<boolean> {
  const { error } = await supabase
    .from('assets')
    .update({
      amount: updates.amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', assetId);

  if (error) {
    console.error('Error updating asset:', error);
    return false;
  }
  return true;
}

export async function deleteAssetById(assetId: string): Promise<boolean> {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', assetId);

  if (error) {
    console.error('Error deleting asset:', error);
    return false;
  }
  return true;
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export async function getAllTransactions(): Promise<TransactionWithDetails[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      holder:holders!transactions_holder_id_fkey(*),
      from_token_data:token_whitelist!transactions_from_token_fkey(*),
      to_token_data:token_whitelist!transactions_to_token_fkey(*)
    `)
    .order('requested_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getTransactionsByHolderId(holderId: string): Promise<TransactionWithDetails[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      holder:holders!transactions_holder_id_fkey(*),
      from_token_data:token_whitelist!transactions_from_token_fkey(*),
      to_token_data:token_whitelist!transactions_to_token_fkey(*)
    `)
    .eq('holder_id', holderId)
    .order('requested_at', { ascending: false });

  if (error) {
    console.error('Error fetching holder transactions:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getPendingTransactions(): Promise<TransactionWithDetails[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      holder:holders!transactions_holder_id_fkey(*),
      from_token_data:token_whitelist!transactions_from_token_fkey(*),
      to_token_data:token_whitelist!transactions_to_token_fkey(*)
    `)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending transactions:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function createTransaction(
  holderId: string,
  type: TransactionType,
  data: {
    from_token?: string;
    to_token?: string;
    amount: string;
    fee?: string;
    net_amount: string;
    notes?: string;
  }
): Promise<Transaction | null> {
  const { data: result, error } = await supabase
    .from('transactions')
    .insert({
      holder_id: holderId,
      transaction_type: type,
      from_token: data.from_token || null,
      to_token: data.to_token || null,
      amount: data.amount,
      fee: data.fee || '0',
      net_amount: data.net_amount,
      notes: data.notes || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    return null;
  }
  return result;
}

export async function approveTransaction(
  transactionId: string,
  approvedBy: string,
  executionPrice?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Fetch and validate transaction
    console.log('[approveTransaction] Starting approval for transaction:', transactionId);
    
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .maybeSingle();

    if (fetchError) {
      console.error('[approveTransaction] Database error fetching transaction:', fetchError);
      return { success: false, error: 'Database error: ' + fetchError.message };
    }

    if (!transaction) {
      console.error('[approveTransaction] Transaction not found:', transactionId);
      return { success: false, error: 'Transaction not found' };
    }

    // Step 2: Validate transaction status
    if (transaction.status !== 'pending') {
      console.error('[approveTransaction] Transaction already processed:', transaction.status);
      return { success: false, error: `Transaction already ${transaction.status}` };
    }

    // Step 3: Validate holder exists
    const { data: holder, error: holderError } = await supabase
      .from('holders')
      .select('id, name')
      .eq('id', transaction.holder_id)
      .maybeSingle();

    if (holderError || !holder) {
      console.error('[approveTransaction] Holder not found:', transaction.holder_id);
      return { success: false, error: 'Holder not found' };
    }

    // Step 4: Validate execution price for swap
    if (transaction.transaction_type === 'swap') {
      if (!executionPrice || parseFloat(executionPrice) <= 0) {
        console.error('[approveTransaction] Invalid execution price for swap');
        return { success: false, error: 'Execution price required for swap transactions' };
      }
    }

    // Step 5: Calculate received amount for swap
    let receivedAmount = transaction.received_amount;
    if (transaction.transaction_type === 'swap' && executionPrice) {
      receivedAmount = (parseFloat(transaction.net_amount) * parseFloat(executionPrice)).toFixed(8);
      console.log('[approveTransaction] Calculated received amount:', receivedAmount);
    }

    // Step 6: Validate balances for swap and sell
    if (transaction.transaction_type === 'swap' || transaction.transaction_type === 'sell') {
      const { data: fromAsset, error: assetError } = await supabase
        .from('assets')
        .select('amount')
        .eq('holder_id', transaction.holder_id)
        .eq('token_symbol', transaction.from_token)
        .maybeSingle();

      if (assetError) {
        console.error('[approveTransaction] Error checking balance:', assetError);
        return { success: false, error: 'Error checking holder balance' };
      }

      if (!fromAsset) {
        console.error('[approveTransaction] Holder does not have from_token:', transaction.from_token);
        return { success: false, error: `Holder does not have ${transaction.from_token}` };
      }

      const currentBalance = parseFloat(fromAsset.amount);
      const requiredAmount = parseFloat(transaction.amount);

      if (currentBalance < requiredAmount) {
        console.error('[approveTransaction] Insufficient balance:', { currentBalance, requiredAmount });
        return { 
          success: false, 
          error: `Insufficient balance. Has ${currentBalance}, needs ${requiredAmount}` 
        };
      }
    }

    // Step 7: Validate tokens exist in whitelist
    if (transaction.from_token) {
      const { data: fromToken } = await supabase
        .from('token_whitelist')
        .select('symbol')
        .eq('symbol', transaction.from_token)
        .maybeSingle();

      if (!fromToken) {
        console.error('[approveTransaction] from_token not in whitelist:', transaction.from_token);
        return { success: false, error: `Token ${transaction.from_token} not in whitelist` };
      }
    }

    if (transaction.to_token) {
      const { data: toToken } = await supabase
        .from('token_whitelist')
        .select('symbol')
        .eq('symbol', transaction.to_token)
        .maybeSingle();

      if (!toToken) {
        console.error('[approveTransaction] to_token not in whitelist:', transaction.to_token);
        return { success: false, error: `Token ${transaction.to_token} not in whitelist` };
      }
    }

    console.log('[approveTransaction] All validations passed, updating balances...');

    // Step 8: Update balances based on transaction type
    if (transaction.transaction_type === 'swap') {
      // Deduct from_token
      const { data: fromAsset } = await supabase
        .from('assets')
        .select('id, amount')
        .eq('holder_id', transaction.holder_id)
        .eq('token_symbol', transaction.from_token)
        .single();

      if (fromAsset) {
        const newFromAmount = (parseFloat(fromAsset.amount) - parseFloat(transaction.amount)).toFixed(8);
        console.log('[approveTransaction] Updating from_token balance:', { old: fromAsset.amount, new: newFromAmount });
        
        const { error: updateFromError } = await supabase
          .from('assets')
          .update({ 
            amount: newFromAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', fromAsset.id);

        if (updateFromError) {
          console.error('[approveTransaction] Error updating from_token balance:', updateFromError);
          return { success: false, error: 'Failed to update from_token balance' };
        }
      }

      // Add or update to_token
      const { data: toAsset } = await supabase
        .from('assets')
        .select('id, amount')
        .eq('holder_id', transaction.holder_id)
        .eq('token_symbol', transaction.to_token)
        .maybeSingle();

      if (toAsset) {
        const newToAmount = (parseFloat(toAsset.amount) + parseFloat(receivedAmount || '0')).toFixed(8);
        console.log('[approveTransaction] Updating to_token balance:', { old: toAsset.amount, new: newToAmount });
        
        const { error: updateToError } = await supabase
          .from('assets')
          .update({ 
            amount: newToAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', toAsset.id);

        if (updateToError) {
          console.error('[approveTransaction] Error updating to_token balance:', updateToError);
          return { success: false, error: 'Failed to update to_token balance' };
        }
      } else {
        console.log('[approveTransaction] Creating new to_token asset:', transaction.to_token);
        
        const { error: insertToError } = await supabase
          .from('assets')
          .insert({
            holder_id: transaction.holder_id,
            token_symbol: transaction.to_token,
            amount: receivedAmount || '0',
          });

        if (insertToError) {
          console.error('[approveTransaction] Error creating to_token asset:', insertToError);
          return { success: false, error: 'Failed to create to_token asset: ' + insertToError.message };
        }
      }
    } else if (transaction.transaction_type === 'buy') {
      // Add or update to_token
      const { data: toAsset } = await supabase
        .from('assets')
        .select('id, amount')
        .eq('holder_id', transaction.holder_id)
        .eq('token_symbol', transaction.to_token)
        .maybeSingle();

      if (toAsset) {
        const newAmount = (parseFloat(toAsset.amount) + parseFloat(transaction.amount)).toFixed(8);
        console.log('[approveTransaction] Updating buy token balance:', { old: toAsset.amount, new: newAmount });
        
        const { error: updateError } = await supabase
          .from('assets')
          .update({ 
            amount: newAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', toAsset.id);

        if (updateError) {
          console.error('[approveTransaction] Error updating buy token balance:', updateError);
          return { success: false, error: 'Failed to update token balance' };
        }
      } else {
        console.log('[approveTransaction] Creating new buy token asset:', transaction.to_token);
        
        const { error: insertError } = await supabase
          .from('assets')
          .insert({
            holder_id: transaction.holder_id,
            token_symbol: transaction.to_token,
            amount: transaction.amount,
          });

        if (insertError) {
          console.error('[approveTransaction] Error creating buy token asset:', insertError);
          return { success: false, error: 'Failed to create token asset: ' + insertError.message };
        }
      }
    } else if (transaction.transaction_type === 'sell') {
      // Deduct from_token
      const { data: fromAsset } = await supabase
        .from('assets')
        .select('id, amount')
        .eq('holder_id', transaction.holder_id)
        .eq('token_symbol', transaction.from_token)
        .single();

      if (fromAsset) {
        const newAmount = (parseFloat(fromAsset.amount) - parseFloat(transaction.amount)).toFixed(8);
        console.log('[approveTransaction] Updating sell token balance:', { old: fromAsset.amount, new: newAmount });
        
        const { error: updateError } = await supabase
          .from('assets')
          .update({ 
            amount: newAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', fromAsset.id);

        if (updateError) {
          console.error('[approveTransaction] Error updating sell token balance:', updateError);
          return { success: false, error: 'Failed to update token balance' };
        }
      }
    }

    // Step 9: Update transaction status
    console.log('[approveTransaction] Updating transaction status to approved...');
    
    const updateData: {
      status: TransactionStatus;
      approved_at: string;
      approved_by: string;
      execution_price?: string;
      received_amount?: string;
      updated_at: string;
    } = {
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: approvedBy,
      updated_at: new Date().toISOString(),
    };

    if (executionPrice) {
      updateData.execution_price = executionPrice;
    }

    if (receivedAmount) {
      updateData.received_amount = receivedAmount;
    }

    const { error: updateTransactionError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId);

    if (updateTransactionError) {
      console.error('[approveTransaction] Error updating transaction status:', updateTransactionError);
      return { success: false, error: 'Failed to update transaction status' };
    }

    // Step 10: Record commission for swap transactions
    if (transaction.transaction_type === 'swap' && parseFloat(transaction.fee) > 0) {
      console.log('[approveTransaction] Recording commission...');
      
      const { error: commissionError } = await supabase
        .from('commissions')
        .insert({
          transaction_id: transactionId,
          holder_id: transaction.holder_id,
          fee_amount: transaction.fee,
          fee_token: transaction.from_token,
        });

      if (commissionError) {
        console.error('[approveTransaction] Error recording commission:', commissionError);
        // Don't fail the entire transaction for commission recording error
      }
    }

    console.log('[approveTransaction] Transaction approved successfully');
    return { success: true };

  } catch (error) {
    console.error('[approveTransaction] Unexpected error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function rejectTransaction(transactionId: string, approvedBy: string): Promise<boolean> {
  const { error } = await supabase
    .from('transactions')
    .update({
      status: 'rejected',
      approved_at: new Date().toISOString(),
      approved_by: approvedBy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transactionId);

  if (error) {
    console.error('Error rejecting transaction:', error);
    return false;
  }
  return true;
}

export async function updateTransactionExecutionPrice(
  transactionId: string,
  executionPrice: string,
  receivedAmount: string
): Promise<boolean> {
  const { error } = await supabase
    .from('transactions')
    .update({
      execution_price: executionPrice,
      received_amount: receivedAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transactionId);

  if (error) {
    console.error('Error updating execution price:', error);
    return false;
  }
  return true;
}

// ============================================================================
// COMMISSION CALCULATIONS
// ============================================================================

export async function getCommissionSummary() {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      holder_id,
      fee,
      transaction_type,
      status,
      holder:holders!transactions_holder_id_fkey(name)
    `)
    .eq('status', 'approved')
    .eq('transaction_type', 'swap');

  if (error) {
    console.error('Error fetching commission data:', error);
    return null;
  }

  return Array.isArray(data) ? data : [];
}
