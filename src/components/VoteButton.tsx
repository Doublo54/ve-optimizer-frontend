import React from 'react';
import { useAccount } from 'wagmi';
import { Button } from './ui/button';
import { Loading } from './ui/loading';
import { useOptimizerStore } from '../stores/optimizerStore';
import { executeVote } from '../utils/api';
import { toast } from 'sonner';

export const VoteButton: React.FC = () => {
  const {
    selectedPools,
    poolAllocations,
    isVoting,
    setVoting,
    setError,
  } = useOptimizerStore();

  // Check wallet connection directly from wagmi for real-time status
  const { isConnected } = useAccount();

  const handleVote = async () => {
    if (!isConnected) {
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

  const isDisabled = !isConnected || selectedPools.length === 0 || isVoting;

  // Determine button text and state
  const getButtonContent = () => {
    if (isVoting) {
      return (
        <>
          <Loading size="sm" />
          <span>Submitting Vote...</span>
        </>
      );
    }
    
    if (!isConnected) {
      return 'Connect Wallet to Vote';
    }
    
    if (selectedPools.length === 0) {
      return 'Select Pools to Vote';
    }
    
    return `Vote for ${selectedPools.length} Pool${selectedPools.length !== 1 ? 's' : ''}`;
  };

  return (
    <Button
      onClick={handleVote}
      disabled={isDisabled}
      className="w-full !bg-green-600 hover:!bg-green-700 !text-white disabled:!bg-neutral-300 disabled:!text-neutral-500"
      size="lg"
    >
      {getButtonContent()}
    </Button>
  );
};
