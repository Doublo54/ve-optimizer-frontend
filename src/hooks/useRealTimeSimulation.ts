import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useOptimizerStore } from '../stores/optimizerStore';
import { simulateVote, percentageToBasisPoints, validateAllocations } from '../utils/api';

export function useRealTimeSimulation() {
  const {
    selectedChain,
    votingPower,
    selectedPools,
    poolAllocations,
    setSimulation,
    setOptimization,
    setMultiOptimizationResults,
    setError,
  } = useOptimizerStore();

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const weights = selectedPools.map(pool => percentageToBasisPoints(poolAllocations[pool] || 0));
      return simulateVote(selectedChain, {
        pools: selectedPools,
        weights,
        votingPower,
      });
    },
    onSuccess: (result) => {
      setSimulation(result);
      setOptimization(null); // Clear optimization results when running manual simulation
      // Don't clear multiOptimizationResults here - only clear when explicitly running manual simulation
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Simulation failed';
      setError(message);
    },
  });

  useEffect(() => {
    // Only simulate if we have selected pools and valid allocations
    if (selectedPools.length > 0 && votingPower > 0) {
      const totalAllocation = Object.values(poolAllocations).reduce((sum, pct) => sum + pct, 0);

      // Only trigger simulation if allocations are valid (close to 100%)
      if (Math.abs(totalAllocation - 100) < 0.1) {
        // Debounce the simulation by 500ms to avoid too many requests
        const timeoutId = setTimeout(() => {
          simulateMutation.mutate();
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [selectedChain, votingPower, selectedPools, poolAllocations]);

  return {
    isSimulating: simulateMutation.isPending,
    simulationError: simulateMutation.error,
  };
}
