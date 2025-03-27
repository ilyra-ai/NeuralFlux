import { PublicKey } from '@solana/web3.js';

// Flux token interface definition
export interface FluxTokenInfo {
  symbol: string;
  name: string;
  totalSupply: number;
  decimals: number;
  address: string;
}

// User token balance interface
export interface TokenBalance {
  amount: number;
  uiAmount: number; // Formatted display amount
}

// Mock Flux token information
export const FLUX_TOKEN_INFO: FluxTokenInfo = {
  symbol: 'FLUX',
  name: 'NeuralFlux Token',
  totalSupply: 1_000_000_000, // 1 billion total supply
  decimals: 9,
  address: 'FLUX1111111111111111111111111111111111111111',
};

// Mock get token balance
export const getFluxBalance = async (owner: PublicKey): Promise<TokenBalance> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock balance - this would be a real API call in production
  const mockAmount = 10000 + Math.floor(Math.random() * 5000);
  
  return {
    amount: mockAmount * Math.pow(10, FLUX_TOKEN_INFO.decimals),
    uiAmount: mockAmount,
  };
};

// Mock token transfer
export const transferFlux = async (
  sender: PublicKey,
  recipient: string,
  amount: number
): Promise<{ txId: string; success: boolean }> => {
  // Validate parameters
  if (!sender || !recipient || amount <= 0) {
    throw new Error('Invalid transfer parameters');
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return mock transaction ID
  return {
    txId: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    success: true,
  };
};

// Mock token staking
export const stakeFluxTokens = async (
  owner: PublicKey,
  amount: number
): Promise<{ txId: string; success: boolean }> => {
  if (!owner || amount <= 0) {
    throw new Error('Invalid staking parameters');
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    txId: `stake_${Date.now()}`,
    success: true,
  };
};

// Mock reward calculation
export const calculateStakingRewards = async (owner: PublicKey): Promise<number> => {
  // Simple reward calculation mock
  return 1250; // Fixed reward amount
}; 