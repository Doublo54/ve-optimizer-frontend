import { Pool, OptimizationResult, SimulationRequest, ChainType, ApiError, VotingPowerInfo, HYDREX_CONTRACTS, VOTING_ESCROW_ABI, VOTER_ABI } from '../types/api';
import { config } from '../wagmi';
import { readContract, readContracts, writeContract, getAccount } from '@wagmi/core';

// API Configuration
const API_BASE_URL = 'http://zo440ws8gg0s08wsg4k488c8.94.130.107.60.sslip.io/';
const HYDREX_API_URL = 'https://api.hydrex.fi/strategies';

/**
 * Fetch all pools for a given chain
 * GET https://api.hydrex.fi/strategies
 */
export async function fetchPools(chain: ChainType): Promise<Pool[]> {
  try {
    const response = await fetch(HYDREX_API_URL);

    if (!response.ok) {
      throw new ApiError(`Failed to fetch pools: ${response.statusText}`, response.status);
    }

    const data: Pool[] = await response.json();

    // Filter pools by chain - convert chain name to chainId
    // Base = 8453, etc.
    const chainIdMap: Record<ChainType, number> = {
      base: 8453,
      linea: 59144,
      polygon: 137,
      unichain: 1301,
      ethereum: 1,
      arbitrum: 42161,
    };

    const targetChainId = chainIdMap[chain];
    const filteredData = data.filter(pool => pool.chainId === targetChainId);

    return filteredData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Run manual simulation with specific pool allocations
 * POST /vestrategies/simulate-vote?chain={chain}
 */
export async function simulateVote(
  chain: ChainType,
  request: SimulationRequest
): Promise<OptimizationResult> {
  try {
    // Weights are already in basis points from the frontend
    const weightsInBasisPoints = request.weights;

    // Validate weights sum to 10000
    const totalWeight = weightsInBasisPoints.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight !== 10000) {
      throw new ApiError(`Weights must sum to 10000 basis points (100%), got ${totalWeight}`);
    }

    const response = await fetch(`${API_BASE_URL}vestrategies/simulate-vote?chain=${chain}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pools: request.pools,
        weights: weightsInBasisPoints,
        votingPower: request.votingPower,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(`Simulation failed: ${errorText}`, response.status);
    }

    const data: OptimizationResult = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get optimal allocation using the optimizer
 * GET /optimizer?votingPower={power}&maxPools={max}&chain={chain}&blacklist={addresses}
 */
export async function getOptimalAllocation(
  votingPower: number,
  maxPools: number = 10,
  chain: ChainType,
  blacklist: string[] = []
): Promise<OptimizationResult> {
  try {
    const params = new URLSearchParams({
      votingPower: Math.floor(votingPower).toString(),
      maxPools: maxPools.toString(),
      chain,
    });

    if (blacklist.length > 0) {
      params.append('blacklist', blacklist.join(','));
    }

    const response = await fetch(`${API_BASE_URL}optimizer?${params}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(`Optimization failed: ${errorText}`, response.status);
    }

    const data: OptimizationResult = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch pools from Hydrex API (alternative data source)
 * GET https://api.hydrex.fi/strategies
 */
export async function fetchHydrexPools(): Promise<Pool[]> {
  try {
    const response = await fetch(HYDREX_API_URL);

    if (!response.ok) {
      throw new ApiError(`Failed to fetch Hydrex pools: ${response.statusText}`, response.status);
    }

    const data: Pool[] = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


// Utility functions for data transformation

/**
 * Convert percentage to basis points (multiply by 100)
 */
export function percentageToBasisPoints(percentage: number): number {
  return Math.round(percentage * 100);
}

/**
 * Convert basis points to percentage (divide by 100)
 */
export function basisPointsToPercentage(basisPoints: number): number {
  return basisPoints / 100;
}

/**
 * Validate that allocations sum to 100%
 */
export function validateAllocations(allocations: Record<string, number>): boolean {
  const total = Object.values(allocations).reduce((sum, percentage) => sum + percentage, 0);
  return Math.abs(total - 100) < 0.01; // Allow small floating point errors
}

/**
 * Format currency values for display
 * Shows whole numbers (no cents) for values >= 1000
 */
export function formatCurrency(value: number): string {
  if (value >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format large numbers with appropriate suffixes
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
}

// Blockchain utility functions

/**
 * Get the last Thursday at 00:00 UTC timestamp
 */
export function getLastThursdayTimestamp(): number {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 4 = Thursday
  const daysSinceThursday = dayOfWeek >= 4 ? dayOfWeek - 4 : dayOfWeek + 3;
  const lastThursday = new Date(now);
  lastThursday.setUTCDate(now.getUTCDate() - daysSinceThursday);
  lastThursday.setUTCHours(0, 0, 0, 0);
  return Math.floor(lastThursday.getTime() / 1000);
}

/**
 * Get voting power from Hydrex voting escrow contract
 */
export async function getVotingPower(userAddress: `0x${string}`): Promise<VotingPowerInfo> {
  try {
    const timestamp = getLastThursdayTimestamp();

    const votingPower = await readContract(config, {
      address: HYDREX_CONTRACTS.votingEscrow,
      abi: VOTING_ESCROW_ABI,
      functionName: 'getPastVotes',
      args: [userAddress, BigInt(timestamp)],
    });

    // Convert from wei to ether (assuming 18 decimals)
    const votingPowerEther = Number(votingPower) / 1e18;

    return {
      address: userAddress,
      votingPower: votingPower,
      timestamp,
      formattedPower: votingPowerEther.toFixed(2),
    };
  } catch (error) {
    throw new ApiError(`Failed to get voting power: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute vote on Hydrex voter contract
 */
export async function executeVote(
  poolAddresses: `0x${string}`[],
  proportions: number[]
): Promise<`0x${string}`> {
  try {
    // Convert proportions to basis points (multiply by 100)
    const weightsInBasisPoints = proportions.map(p => BigInt(Math.floor(p * 100)));

    const hash = await writeContract(config, {
      address: HYDREX_CONTRACTS.voter,
      abi: VOTER_ABI,
      functionName: 'vote',
      args: [poolAddresses, weightsInBasisPoints],
    });

    return hash;
  } catch (error) {
    throw new ApiError(`Failed to execute vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(): boolean {
  const account = getAccount(config);
  return account.isConnected;
}

/**
 * Get current connected wallet address
 */
export function getConnectedAddress(): `0x${string}` | null {
  const account = getAccount(config);
  return account.address || null;
}

/**
 * Get current votes for a user from the Voter contract
 * Uses multicall to minimize on-chain calls (3 RPC calls total instead of 1 + 2N)
 */
export async function getCurrentVotes(userAddress: `0x${string}`): Promise<{
  poolAddresses: string[];
  weights: bigint[];
  percentages: number[];
  totalWeight: bigint;
}> {
  try {
    // Step 1: Get the number of pools the user has voted for (1 call)
    const poolVoteLength = await readContract(config, {
      address: HYDREX_CONTRACTS.voter,
      abi: VOTER_ABI,
      functionName: 'poolVoteLength',
      args: [userAddress],
    }) as bigint;

    const length = Number(poolVoteLength);

    if (length === 0) {
      return {
        poolAddresses: [],
        weights: [],
        percentages: [],
        totalWeight: BigInt(0),
      };
    }

    // Step 2: Batch all poolVote(index) calls using multicall (1 multicall)
    const poolVoteContracts = Array.from({ length }, (_, i) => ({
      address: HYDREX_CONTRACTS.voter,
      abi: VOTER_ABI,
      functionName: 'poolVote' as const,
      args: [userAddress, BigInt(i)] as const,
    }));

    const poolAddressResults = await readContracts(config, {
      contracts: poolVoteContracts,
    });

    const poolAddresses = poolAddressResults
      .map(result => result.status === 'success' ? result.result as string : null)
      .filter((addr): addr is string => addr !== null);

    if (poolAddresses.length === 0) {
      return {
        poolAddresses: [],
        weights: [],
        percentages: [],
        totalWeight: BigInt(0),
      };
    }

    // Step 3: Batch all votes(userAddress, poolAddress) calls using multicall (1 multicall)
    const votesContracts = poolAddresses.map(poolAddr => ({
      address: HYDREX_CONTRACTS.voter,
      abi: VOTER_ABI,
      functionName: 'votes' as const,
      args: [userAddress, poolAddr as `0x${string}`] as const,
    }));

    const votesResults = await readContracts(config, {
      contracts: votesContracts,
    });

    const weights = votesResults.map(result => 
      result.status === 'success' ? result.result as bigint : BigInt(0)
    );

    // Calculate total weight from individual votes
    const totalWeight = weights.reduce((sum, w) => sum + w, BigInt(0));

    // Convert to percentages
    const percentages = weights.map(weight => {
      if (totalWeight === BigInt(0)) return 0;
      return (Number(weight) / Number(totalWeight)) * 100;
    });

    return {
      poolAddresses,
      weights,
      percentages,
      totalWeight,
    };
  } catch (error) {
    throw new ApiError(`Failed to get current votes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
