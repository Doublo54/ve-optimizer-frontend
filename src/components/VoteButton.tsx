import React from 'react';
import { Button } from './ui/button';
import { Loading } from './ui/loading';
import { useOptimizerStore } from '../stores/optimizerStore';
import { executeVote } from '../utils/api';
import { toast } from 'sonner';

export const VoteButton: React.FC = () => {
  const {
    selectedPools,
    poolAllocations,
    walletConnected,
    isVoting,
    setVoting,
    setError,
  } = useOptimizerStore();

  const handleVote = async () => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (selectedPools.length === 0) {
      toast.error('Please select at least one pool to vote for');
      return;
    }

    // Validate allocations sum to 100%
    const totalAllocation = Object.values(poolAllocations).reduce((sum, allocation) => sum + allocation, 0);
    if (Math.abs(totalAllocation - 100) > 0.1) {
      toast.error('Pool allocations must sum to 100%');
      return;
    }

    try {
      setVoting(true);
      setError(null);

      // Convert pool addresses and allocations to the format expected by the contract
      const addresses = selectedPools.map(addr => addr as `0x${string}`);
      const proportions = selectedPools.map(poolAddr => poolAllocations[poolAddr] || 0);

      const txHash = await executeVote(addresses, proportions);

      toast.success(`Vote submitted successfully! Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Vote failed: ${errorMessage}`);
    } finally {
      setVoting(false);
    }
  };

  const isDisabled = !walletConnected || selectedPools.length === 0 || isVoting;

  return (
    <Button
      onClick={handleVote}
      disabled={isDisabled}
      className="w-full"
      size="lg"
    >
      {isVoting ? (
        <div className="flex items-center space-x-2">
          <Loading size="sm" />
          <span>Submitting Vote...</span>
        </div>
      ) : (
        `Vote for ${selectedPools.length} Pool${selectedPools.length !== 1 ? 's' : ''}`
      )}
    </Button>
  );
};
