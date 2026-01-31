import { Layout } from './layout/Layout';
import { ChainSelector } from './ChainSelector';
import { VotingPowerInput } from './VotingPowerInput';
import { MaxPoolsSelector } from './MaxPoolsSelector';
import { PoolList } from './PoolList';
import { OptimizationControls } from './OptimizationControls';
import { ResultsDisplay } from './ResultsDisplay';
import { ErrorDisplay } from './ErrorDisplay';
import { MultiOptimizationResults } from './MultiOptimizationResults';
import { VotingPowerDisplay } from './VotingPowerDisplay';
import { AdvancedOptimizationSettings } from './AdvancedOptimizationSettings';
import { CurrentVoteDisplay } from './CurrentVoteDisplay';
import { useRealTimeSimulation } from '../hooks/useRealTimeSimulation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function Optimizer() {
  // Enable real-time simulation
  useRealTimeSimulation();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">veToken Voting Optimizer</h1>
          <p className="text-lg text-neutral-600 max-w-3xl leading-relaxed">
            Optimize your veToken voting power allocation across liquidity pools to maximize returns from protocol fees and external bribes.
          </p>
        </div>

        {/* Error Display - Always visible at top for critical feedback */}
        <ErrorDisplay />

        {/* ========== CONFIGURATION SECTION ========== */}
        <div className="space-y-6">
          {/* Wallet Connection */}
          <VotingPowerDisplay />

          {/* Current Vote Status */}
          <CurrentVoteDisplay />

          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Select your chain and enter your voting power to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <ChainSelector />
                <VotingPowerInput />
                <MaxPoolsSelector />
              </div>
            </CardContent>
          </Card>

          {/* Pool Selection and Allocation */}
          <PoolList />

          {/* Optimization Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization</CardTitle>
              <CardDescription>
                Find optimal allocations or run simulations for your voting power
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <AdvancedOptimizationSettings />
              <OptimizationControls />
            </CardContent>
          </Card>
        </div>

        {/* ========== RESULTS SECTION ========== */}
        <div className="space-y-6 border-t border-neutral-200 pt-8">
          {/* Advanced Optimization Comparison */}
          <MultiOptimizationResults />

          {/* Selected Allocation Results (includes vote button) */}
          <ResultsDisplay />
        </div>
      </div>
    </Layout>
  );
}
