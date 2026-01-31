import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loading } from './ui/loading';
import { useOptimizerStore } from '../stores/optimizerStore';
import { getCurrentVotes, simulateVote } from '../utils/api';
import { formatCurrency, formatPercentage } from '../utils/api';
import { OptimizationResult } from '../types/api';

interface CurrentVoteBasic {
  poolAddress: string;
  percentage: number;
}

export const CurrentVoteDisplay: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { votingPower: storeVotingPower, selectedChain } = useOptimizerStore();
  const [currentVotes, setCurrentVotes] = useState<CurrentVoteBasic[]>([]);
  const [simulatedEarnings, setSimulatedEarnings] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentVotes = async () => {
      if (!isConnected || !address) {
        setCurrentVotes([]);
        setSimulatedEarnings(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch current votes from blockchain
        const votes = await getCurrentVotes(address);
        
        if (!votes || votes.poolAddresses.length === 0) {
          setCurrentVotes([]);
          setSimulatedEarnings(null);
          setIsLoading(false);
          return;
        }

        // Store basic vote info
        const basicVotes: CurrentVoteBasic[] = votes.poolAddresses.map((poolAddr, idx) => ({
          poolAddress: poolAddr,
          percentage: votes.percentages[idx],
        }));

        setCurrentVotes(basicVotes);

        // Get simulation results from API - this gives us pool names and earnings
        if (storeVotingPower > 0 && votes.poolAddresses.length > 0) {
          try {
            // Convert percentages to basis points
            const weightsInBasisPoints = votes.percentages.map(p => Math.round(p * 100));
            const totalWeight = weightsInBasisPoints.reduce((sum, w) => sum + w, 0);
            
            // Only simulate if weights sum to 10000 (allow small rounding adjustments)
            if (totalWeight > 0 && totalWeight <= 10000) {
              // Adjust for rounding errors to ensure weights sum to exactly 10000
              const adjustedWeights = [...weightsInBasisPoints];
              const diff = 10000 - totalWeight;
              if (diff !== 0 && adjustedWeights.length > 0) {
                // Add the difference to the largest weight
                const maxIdx = adjustedWeights.indexOf(Math.max(...adjustedWeights));
                adjustedWeights[maxIdx] += diff;
              }
              
              const simulation = await simulateVote(selectedChain, {
                pools: votes.poolAddresses,
                weights: adjustedWeights,
                votingPower: storeVotingPower,
              });
              setSimulatedEarnings(simulation);
            }
          } catch (simError) {
            console.error('Failed to simulate current votes:', simError);
          }
        }
      } catch (err) {
        console.error('Failed to fetch current votes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load current votes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentVotes();
  }, [isConnected, address, storeVotingPower, selectedChain]);

  // Don't show the card if wallet is not connected
  if (!isConnected) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Vote Status</CardTitle>
        <CardDescription>
          Your current on-chain votes and estimated earnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loading size="md" />
            <span className="ml-3 text-neutral-600">Loading current votes...</span>
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        ) : currentVotes.length === 0 ? (
          <div className="text-sm text-neutral-600 bg-neutral-50 p-4 rounded-lg text-center">
            No active votes found. Vote for pools to start earning rewards.
          </div>
        ) : (
          <>
            {/* Current Votes Table - use simulation data for names and earnings when available */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-neutral-700">Pool Allocations</h4>
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-neutral-700">Pool</th>
                      <th className="text-right py-2 px-3 font-medium text-neutral-700">Vote %</th>
                      <th className="text-right py-2 px-3 font-medium text-neutral-700">Est. Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulatedEarnings ? (
                      // Use simulation allocations for full details
                      simulatedEarnings.allocations.map((allocation, idx) => (
                        <tr 
                          key={allocation.poolAddress} 
                          className={idx !== simulatedEarnings.allocations.length - 1 ? 'border-b border-neutral-100' : ''}
                        >
                          <td className="py-2.5 px-3 text-neutral-900">
                            {allocation.poolName}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-neutral-900">
                            {formatPercentage(allocation.votePercentage)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-green-600 font-medium">
                            {allocation.expectedReturn > 0 ? formatCurrency(allocation.expectedReturn) : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      // Fallback to basic vote info when simulation not available
                      currentVotes.map((vote, idx) => (
                        <tr 
                          key={vote.poolAddress} 
                          className={idx !== currentVotes.length - 1 ? 'border-b border-neutral-100' : ''}
                        >
                          <td className="py-2.5 px-3 text-neutral-900 font-mono text-xs">
                            {`${vote.poolAddress.slice(0, 6)}...${vote.poolAddress.slice(-4)}`}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-neutral-900">
                            {formatPercentage(vote.percentage)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-neutral-400">
                            -
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Earnings Estimate */}
            {simulatedEarnings && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-neutral-700">Estimated Annual Earnings</h4>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-neutral-600 mb-1">Total Earnings</div>
                      <div className="text-2xl font-bold text-green-700">
                        {formatCurrency(simulatedEarnings.totalExpectedReturn)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-600 mb-1">From Fees</div>
                      <div className="text-xl font-semibold text-green-600">
                        {formatCurrency(simulatedEarnings.totalExpectedFeeReturn)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-600 mb-1">From Bribes</div>
                      <div className="text-xl font-semibold text-green-600">
                        {formatCurrency(simulatedEarnings.totalExpectedBribeReturn)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
