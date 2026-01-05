import React, { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useOptimizerStore } from '../stores/optimizerStore';
import { getVotingPower } from '../utils/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Loading } from './ui/loading';

export const VotingPowerDisplay: React.FC = () => {
  const {
    walletConnected,
    userAddress,
    blockchainVotingPower,
    isVotingPowerLoading,
    setWalletConnected,
    setUserAddress,
    setBlockchainVotingPower,
    setVotingPowerLoading,
    setVotingPower,
  } = useOptimizerStore();

  const { address, isConnected } = useAccount();

  // Watch for account changes
  useEffect(() => {
    setWalletConnected(isConnected);
    setUserAddress(address || null);
    if (!isConnected) {
      setBlockchainVotingPower(null);
    }
  }, [isConnected, address, setWalletConnected, setUserAddress, setBlockchainVotingPower]);


  // Fetch voting power when wallet connects
  useEffect(() => {
    if (isConnected && address && !blockchainVotingPower && !isVotingPowerLoading) {
      const fetchVotingPower = async () => {
        try {
          setVotingPowerLoading(true);
          const powerInfo = await getVotingPower(address);
          setBlockchainVotingPower(powerInfo);
          // Update the voting power in the optimizer store (convert to number for display)
          setVotingPower(Number(powerInfo.votingPower) / 1e18);
        } catch (error) {
          console.error('Failed to fetch voting power:', error);
        } finally {
          setVotingPowerLoading(false);
        }
      };

      fetchVotingPower();
    }
  }, [isConnected, address, blockchainVotingPower, isVotingPowerLoading, setBlockchainVotingPower, setVotingPowerLoading, setVotingPower]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            <h3 className="text-base font-semibold text-neutral-900">Wallet Connection</h3>
            {!isConnected ? (
              <p className="text-sm text-neutral-600 leading-relaxed">
                Connect your wallet to view your voting power and execute votes
              </p>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-neutral-700">Address:</span>
                  <span className="font-mono text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-neutral-700">Voting Power:</span>
                  {isVotingPowerLoading ? (
                    <Loading size="sm" />
                  ) : blockchainVotingPower ? (
                    <span className="font-semibold text-green-600">
                      {blockchainVotingPower.formattedPower} veTokens
                    </span>
                  ) : (
                    <span className="text-neutral-500">Unable to fetch</span>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <ConnectButton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
