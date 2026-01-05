import React, { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useOptimizerStore } from '../stores/optimizerStore';
import { getVotingPower } from '../utils/api';
import { Card } from './ui/card';
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
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Wallet Connection</h3>
          {!isConnected ? (
            <div className="text-sm text-gray-600">
              Connect your wallet to view your voting power and execute votes
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Address:</span>{' '}
                <span className="font-mono text-xs">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Voting Power:</span>{' '}
                {isVotingPowerLoading ? (
                  <Loading size="sm" />
                ) : blockchainVotingPower ? (
                  <span className="font-semibold text-green-600">
                    {blockchainVotingPower.formattedPower} veTokens
                  </span>
                ) : (
                  <span className="text-gray-500">Unable to fetch</span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="ml-4">
          <ConnectButton />
        </div>
      </div>
    </Card>
  );
};
