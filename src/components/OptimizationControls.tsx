import { useMutation } from '@tanstack/react-query';
import { useOptimizerStore } from '../stores/optimizerStore';
import { simulateVote, getOptimalAllocation, validateAllocations, percentageToBasisPoints } from '../utils/api';
import { Button } from './ui/button';
import { Loader2, Play, Zap, RotateCcw, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export function OptimizationControls() {
  const {
    selectedChain,
    votingPower,
    selectedPools,
    poolAllocations,
    blacklistedPools,
    maxPools,
    minPools,
    maxPoolsAdvanced,
    setSimulation,
    setOptimization,
    setMultiOptimizationResults,
    setLoading,
    setError,
    applyOptimalAllocations,
    reset,
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
      setMultiOptimizationResults([]); // Clear advanced optimization results
      toast.success('Simulation completed successfully');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Simulation failed';
      setError(message);
      toast.error(message);
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: () => {
      const blacklist = Array.from(blacklistedPools);
      return getOptimalAllocation(votingPower, maxPools, selectedChain, blacklist);
    },
    onSuccess: (result) => {
      setOptimization(result);
      setSimulation(null); // Clear simulation results when running optimization
      setMultiOptimizationResults([]); // Clear advanced optimization results
      applyOptimalAllocations(result);
      toast.success('Optimization completed successfully');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Optimization failed';
      setError(message);
      toast.error(message);
    },
  });

  const multiOptimizeMutation = useMutation({
    mutationFn: async () => {
      const blacklist = Array.from(blacklistedPools);
      const results = await Promise.all(
        Array.from({ length: maxPoolsAdvanced - minPools + 1 }, (_, i) => minPools + i).map(maxPoolsValue =>
          getOptimalAllocation(votingPower, maxPoolsValue, selectedChain, blacklist).then(result => ({
            maxPools: maxPoolsValue,
            result,
          }))
        )
      );
      return results;
    },
    onSuccess: (results) => {
      setMultiOptimizationResults(results);
      // Sort results by expected return (descending)
      const sortedResults = results.sort((a, b) => b.result.totalExpectedReturn - a.result.totalExpectedReturn);
      // Apply the best result (highest expected return)
      setOptimization(sortedResults[0].result);
      applyOptimalAllocations(sortedResults[0].result, sortedResults[0].maxPools);
      toast.success('Multi-optimization completed successfully');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Multi-optimization failed';
      setError(message);
      toast.error(message);
    },
  });

  const handleSimulate = () => {
    const totalAllocation = Object.values(poolAllocations).reduce((sum, pct) => sum + pct, 0);

    if (selectedPools.length === 0) {
      toast.error('Please select at least one pool');
      return;
    }

    if (Math.abs(totalAllocation - 100) > 0.1) {
      toast.error('Pool allocations must sum to 100%');
      return;
    }

    if (votingPower <= 0) {
      toast.error('Please enter a valid voting power');
      return;
    }

    simulateMutation.mutate();
  };

  const handleOptimize = () => {
    if (votingPower <= 0) {
      toast.error('Please enter a valid voting power');
      return;
    }

    optimizeMutation.mutate();
  };

  const isSimulating = simulateMutation.isPending;
  const isOptimizing = optimizeMutation.isPending;
  const isMultiOptimizing = multiOptimizeMutation.isPending;

  const handleMultiOptimize = () => {
    if (votingPower <= 0) {
      toast.error('Please enter a valid voting power');
      return;
    }

    multiOptimizeMutation.mutate();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={handleSimulate}
          disabled={isSimulating || isOptimizing || isMultiOptimizing}
          variant="outline"
          size="lg"
        >
          {isSimulating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Play className="h-5 w-5" />
          )}
          {isSimulating ? 'Simulating...' : 'Simulate Manual Allocation'}
        </Button>

        <Button
          onClick={handleOptimize}
          disabled={isSimulating || isOptimizing || isMultiOptimizing}
          variant="default"
          size="lg"
        >
          {isOptimizing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Zap className="h-5 w-5" />
          )}
          {isOptimizing ? 'Optimizing...' : 'Find Optimal Allocation'}
        </Button>

        <Button
          onClick={handleMultiOptimize}
          disabled={isSimulating || isOptimizing || isMultiOptimizing}
          variant="default"
          size="lg"
          className="!bg-green-600 hover:!bg-green-700 !text-white md:col-span-2"
        >
          {isMultiOptimizing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <TrendingUp className="h-5 w-5" />
          )}
          {isMultiOptimizing ? 'Analyzing...' : `Advanced Optimization (${minPools}-${maxPoolsAdvanced} pools)`}
        </Button>

        <Button
          onClick={() => {
            reset();
            toast.success('Configuration reset');
          }}
          disabled={isSimulating || isOptimizing || isMultiOptimizing}
          variant="outline"
          size="lg"
          className="md:col-span-2"
        >
          <RotateCcw className="h-5 w-5" />
          Reset Configuration
        </Button>
      </div>
    </div>
  );
}
