import { useOptimizerStore } from '../stores/optimizerStore';
import { formatCurrency, formatPercentage } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function ResultsDisplay() {
  const { currentSimulation, currentOptimization } = useOptimizerStore();

  const result = currentOptimization || currentSimulation;

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expected Returns</CardTitle>
          <CardDescription>
            Select pools and set allocations to see expected returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No results to display yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const isOptimization = !!currentOptimization;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {isOptimization ? 'Optimized Allocation Results' : 'Manual Allocation Results'}
          </CardTitle>
          <CardDescription>
            {isOptimization ? 'Mathematically optimal allocation across all pools' : 'Results from your manual pool allocations'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(result.totalExpectedReturn)}
              </div>
              <div className="text-sm text-muted-foreground">Total Expected Return</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(result.totalExpectedFeeReturn)}
              </div>
              <div className="text-sm text-muted-foreground">
                Fee Returns ({formatPercentage(result.feeSharePercentage)})
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(result.totalExpectedBribeReturn)}
              </div>
              <div className="text-sm text-muted-foreground">
                Bribe Returns ({formatPercentage(100 - result.feeSharePercentage)})
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Pool</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Allocation</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Voting Power</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Expected Return</th>
                </tr>
              </thead>
              <tbody>
                {result.allocations.map((allocation) => (
                  <tr key={allocation.poolAddress} className="border-t">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">
                          {allocation.poolName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {allocation.poolAddress.slice(0, 6)}...{allocation.poolAddress.slice(-4)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {formatPercentage(allocation.votePercentage)}
                    </td>
                    <td className="px-4 py-3">
                      {allocation.votingPower.toFixed(4)} ETH
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-600 font-medium">
                        {formatCurrency(allocation.expectedReturn)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
