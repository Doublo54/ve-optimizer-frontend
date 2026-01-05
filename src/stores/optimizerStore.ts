import { create } from 'zustand';
import { OptimizerState, ChainType, Pool, OptimizationResult, VotingPowerInfo } from '../types/api';

const initialState = {
  selectedChain: 'base' as ChainType,
  votingPower: 1600000,
  selectedPools: [] as string[],
  poolAllocations: {} as Record<string, number>,
  allPools: [] as Pool[],
  currentSimulation: null as OptimizationResult | null,
  currentOptimization: null as OptimizationResult | null,
  multiOptimizationResults: [] as { maxPools: number; result: OptimizationResult }[],
  appliedResultMaxPools: null as number | null,
  maxPools: 5,
  minPools: 1,
  maxPoolsAdvanced: 10,
  blacklistedPools: new Set<string>(),
  walletConnected: false,
  userAddress: null as string | null,
  blockchainVotingPower: null as VotingPowerInfo | null,
  isVotingPowerLoading: false,
  isVoting: false,
  isLoading: false,
  error: null as string | null,
};

export const useOptimizerStore = create<OptimizerState>((set, get) => ({
  ...initialState,


  setVotingPower: (power: number) => {
    set({ votingPower: power });
    // Clear simulation results when voting power changes
    set({ currentSimulation: null });
  },

  setSelectedPools: (pools: string[]) => {
    set({ selectedPools: pools });
    // Reset allocations for pools that are no longer selected
    const { poolAllocations } = get();
    const newAllocations = { ...poolAllocations };
    Object.keys(newAllocations).forEach(poolAddress => {
      if (!pools.includes(poolAddress)) {
        delete newAllocations[poolAddress];
      }
    });
    set({ poolAllocations: newAllocations });
  },

  setPoolAllocation: (poolAddress: string, percentage: number) => {
    set(state => ({
      poolAllocations: {
        ...state.poolAllocations,
        [poolAddress]: percentage,
      },
    }));
  },

  togglePoolSelection: (poolAddress: string) => {
    const { selectedPools } = get();
    const isSelected = selectedPools.includes(poolAddress);

    if (isSelected) {
      // Remove from selection
      const newPools = selectedPools.filter(p => p !== poolAddress);
      set({ selectedPools: newPools });

      // Remove allocation
      const { poolAllocations } = get();
      const newAllocations = { ...poolAllocations };
      delete newAllocations[poolAddress];
      set({ poolAllocations: newAllocations });
    } else {
      // Add to selection
      set({ selectedPools: [...selectedPools, poolAddress] });
    }
  },

  toggleBlacklist: (poolAddress: string) => {
    set(state => {
      const newBlacklist = new Set(state.blacklistedPools);
      if (newBlacklist.has(poolAddress)) {
        newBlacklist.delete(poolAddress);
      } else {
        newBlacklist.add(poolAddress);
      }
      return { blacklistedPools: newBlacklist };
    });
  },

  setAllPools: (pools: Pool[]) => {
    set({ allPools: pools });
  },

  setSimulation: (result: OptimizationResult) => {
    set({ currentSimulation: result });
  },

  setOptimization: (result: OptimizationResult) => {
    set({ currentOptimization: result });
  },

  setMultiOptimizationResults: (results: { maxPools: number; result: OptimizationResult }[]) => {
    set({ multiOptimizationResults: results });
  },

  setMaxPools: (maxPools: number) => {
    set({ maxPools });
  },

  setMinPools: (minPools: number) => {
    set({ minPools });
  },

  setMaxPoolsAdvanced: (maxPoolsAdvanced: number) => {
    set({ maxPoolsAdvanced });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  applyOptimalAllocations: (result: OptimizationResult, maxPools?: number) => {
    const poolAddresses = result.allocations.map(allocation => allocation.poolAddress);
    const allocations: Record<string, number> = {};

    result.allocations.forEach(allocation => {
      allocations[allocation.poolAddress] = allocation.votePercentage;
    });

    set({
      selectedPools: poolAddresses,
      poolAllocations: allocations,
      currentOptimization: result,
      appliedResultMaxPools: maxPools || null,
    });
  },

  reset: () => {
    set(initialState);
  },

  setChain: (chain: ChainType) => {
    set({ selectedChain: chain, allPools: [], currentSimulation: null, currentOptimization: null, multiOptimizationResults: [] });
  },

  // Blockchain actions
  setWalletConnected: (connected: boolean) => {
    set({ walletConnected: connected });
  },

  setUserAddress: (address: string | null) => {
    set({ userAddress: address });
  },

  setBlockchainVotingPower: (power: VotingPowerInfo | null) => {
    set({ blockchainVotingPower: power });
  },

  setVotingPowerLoading: (loading: boolean) => {
    set({ isVotingPowerLoading: loading });
  },

  setVoting: (voting: boolean) => {
    set({ isVoting: voting });
  },
}));
