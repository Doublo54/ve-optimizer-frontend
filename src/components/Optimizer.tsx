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
import { VoteButton } from './VoteButton';
import { AdvancedOptimizationSettings } from './AdvancedOptimizationSettings';
import { useRealTimeSimulation } from '../hooks/useRealTimeSimulation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function Optimizer() {
  // Enable real-time simulation
  useRealTimeSimulation();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">veToken Voting Optimizer</h1>
          <p className="text-muted-foreground">
            Optimize your veToken voting power allocation across liquidity pools to maximize returns from protocol fees and external bribes.
          </p>
        </div>

        <ErrorDisplay />

        <VotingPowerDisplay />

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Select your chain and enter your voting power to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <ChainSelector />
              <VotingPowerInput />
              <MaxPoolsSelector />
            </div>
          </CardContent>
        </Card>

        <PoolList />

        <div className="flex flex-col items-center gap-4">
          <AdvancedOptimizationSettings />
          <OptimizationControls />
          <div className="w-full max-w-md">
            <VoteButton />
          </div>
        </div>

        <MultiOptimizationResults />

        <ResultsDisplay />
      </div>
    </Layout>
  );
}
