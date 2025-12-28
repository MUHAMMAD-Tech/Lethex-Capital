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
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching system settings:', error);
    return null;
  }
  return data;
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
  const settings = await getSystemSettings();
  return settings?.admin_access_code === code;
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
    .order('requested_at', { ascending: true });

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
): Promise<boolean> {
  const updateData: {
    status: TransactionStatus;
    approved_at: string;
    approved_by: string;
    execution_price?: string;
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

  const { error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', transactionId);

  if (error) {
    console.error('Error approving transaction:', error);
    return false;
  }
  return true;
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
