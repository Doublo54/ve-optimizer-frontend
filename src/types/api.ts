// API Response Types for veToken Voting Optimizer

export interface Pool {
  address: string;
  title: string;
  chainId: number;
  gauge: {
    weight: number; // Current total votes on this pool
    feeInUsd: number; // Total annual fee rewards available (USD)
    bribesInUsd: number; // Total annual bribe rewards available (USD)
    apr: number; // Current APR %
    tvl: number; // Total value locked in pool
    dayFarmingApr: number;
    fullFarmingApr: number;
    farmingAprMax: number;
    farmingAprMin: number;
    votingAprProjection: number;
    liveVotingWeight: number;
    isAlive: boolean;
    rewardPerSecond: number;
    rewardForDuration: number;
    periodFinish: number;
    isPeriodFinished: boolean;
    timeUntilPeriodFinish: number;
    campaignBreakdown?: {
      weightFees: number;
      weightToken0: number;
      weightToken1: number;
      inRangeTvl: number;
      dailyRewards: number;
      rewardTokens: any[];
    };
    isCalculating: boolean;
    bribes: {
      bribe: any;
      fee: Array<{
        address: string;
        decimals: number;
        amount: number;
        projectedAmount: number;
        symbol: string;
      }>;
    };
  };
  liquidityType: string;
  riskLevel: number;
  strategist: string;
  tags: string[];
  token0Address: string;
  token1Address: string;
  type: string;
  displayTags: any[];
  order: number;
  riskDescription: string;
}

export interface VoteAllocation {
  poolAddress: string;
  poolName: string;
  votingPower: number; // How much of your voting power allocated (ETH)
  votePercentage: number; // Percentage (0-100)
  pool: Pool;
  expectedReturn: number; // Expected USD return from this pool
  expectedFeeReturn: number; // USD from fees for this pool
  expectedBribeReturn: number; // USD from bribes for this pool
}

export interface OptimizationResult {
  allocations: VoteAllocation[];
  totalExpectedReturn: number; // Total USD expected annual return
  totalExpectedFeeReturn: number; // USD from protocol fees
  totalExpectedBribeReturn: number; // USD from external bribes
  feeSharePercentage: number; // What % of returns come from fees vs bribes
}

export interface SimulationRequest {
  pools: string[]; // Pool addresses
  weights: number[]; // Must sum to 10000 (100% in basis points)
  votingPower: number; // Your veToken voting power in ETH
}

// Chain types
export type ChainType = 'base' | 'linea' | 'polygon' | 'unichain' | 'ethereum' | 'arbitrum';

// API Error types
export class ApiError extends Error {
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Blockchain types
export interface VotingPowerInfo {
  address: string;
  votingPower: bigint;
  timestamp: number;
  formattedPower: string;
}

export interface VoteTransaction {
  addresses: string[];
  proportions: number[];
  timestamp: number;
}

export interface HydrexContracts {
  votingEscrow: `0x${string}`;
  voter: `0x${string}`;
}

// Contract ABIs
export const VOTING_ESCROW_ABI = [
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "getPastVotes",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const VOTER_ABI = [
  {
    inputs: [
      { internalType: "address[]", name: "poolVote", type: "address[]" },
      { internalType: "uint256[]", name: "weights", type: "uint256[]" }
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" }
    ],
    name: "poolVoteLength",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "index", type: "uint256" }
    ],
    name: "poolVote",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "address", name: "pool", type: "address" }
    ],
    name: "votes",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// Hydrex Base contract addresses
export const HYDREX_CONTRACTS: HydrexContracts = {
  votingEscrow: '0x25B2ED7149fb8A05f6eF9407d9c8F878f59cd1e1',
  voter: '0xc69E3eF39E3fFBcE2A1c570f8d3ADF76909ef17b'
};

// Store types for Zustand
export interface OptimizerState {
  // Current selections
  selectedChain: ChainType;
  votingPower: number;
  selectedPools: string[]; // Pool addresses
  poolAllocations: Record<string, number>; // poolAddress -> percentage (0-100)
  maxPools: number;
  minPools: number;
  maxPoolsAdvanced: number;

  // Data from APIs
  allPools: Pool[];
  currentSimulation: OptimizationResult | null;
  currentOptimization: OptimizationResult | null;
  multiOptimizationResults: { maxPools: number; result: OptimizationResult }[];
  appliedResultMaxPools: number | null;

  // Blacklist
  blacklistedPools: Set<string>;

  // Blockchain state
  walletConnected: boolean;
  userAddress: string | null;
  blockchainVotingPower: VotingPowerInfo | null;
  isVotingPowerLoading: boolean;
  isVoting: boolean;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setChain: (chain: ChainType) => void;
  setVotingPower: (power: number) => void;
  setSelectedPools: (pools: string[]) => void;
  setPoolAllocation: (poolAddress: string, percentage: number) => void;
  togglePoolSelection: (poolAddress: string) => void;
  toggleBlacklist: (poolAddress: string) => void;
  setAllPools: (pools: Pool[]) => void;
  setSimulation: (result: OptimizationResult | null) => void;
  setOptimization: (result: OptimizationResult | null) => void;
  setMultiOptimizationResults: (results: { maxPools: number; result: OptimizationResult }[]) => void;
  setMaxPools: (maxPools: number) => void;
  setMinPools: (minPools: number) => void;
  setMaxPoolsAdvanced: (maxPoolsAdvanced: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  applyOptimalAllocations: (result: OptimizationResult, maxPools?: number) => void;
  reset: () => void;

  // Blockchain actions
  setWalletConnected: (connected: boolean) => void;
  setUserAddress: (address: string | null) => void;
  setBlockchainVotingPower: (power: VotingPowerInfo | null) => void;
  setVotingPowerLoading: (loading: boolean) => void;
  setVoting: (voting: boolean) => void;
}
