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
          <div className="text-center py-12 text-neutral-500">
            No results to display yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const isOptimization = !!currentOptimization;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isOptimization ? 'Optimized Allocation Results' : 'Manual Allocation Results'}
        </CardTitle>
        <CardDescription>
          {isOptimization ? 'Mathematically optimal allocation across all pools' : 'Results from your manual pool allocations'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
            <div className="text-3xl font-bold text-green-700">
              {formatCurrency(result.totalExpectedReturn)}
            </div>
            <div className="text-sm font-medium text-green-600 mt-2">Total Expected Return</div>
          </div>
          <div className="text-center p-6 bg-sky-50 rounded-xl border border-sky-200">
            <div className="text-3xl font-bold text-sky-700">
              {formatCurrency(result.totalExpectedFeeReturn)}
            </div>
            <div className="text-sm font-medium text-sky-600 mt-2">
              Fee Returns ({formatPercentage(result.feeSharePercentage)})
            </div>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
            <div className="text-3xl font-bold text-purple-700">
              {formatCurrency(result.totalExpectedBribeReturn)}
            </div>
            <div className="text-sm font-medium text-purple-600 mt-2">
              Bribe Returns ({formatPercentage(100 - result.feeSharePercentage)})
            </div>
          </div>
        </div>

        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Pool</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Allocation</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Voting Power</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Expected Return</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {result.allocations.map((allocation) => (
                  <tr key={allocation.poolAddress} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        <div className="font-medium text-neutral-900">
                          {allocation.poolName}
                        </div>
                        <div className="text-xs text-neutral-500 font-mono mt-0.5">
                          {allocation.poolAddress.slice(0, 6)}...{allocation.poolAddress.slice(-4)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                      {formatPercentage(allocation.votePercentage)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">
                      {allocation.votingPower.toFixed(4)} ETH
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-700 font-semibold text-sm">
                        {formatCurrency(allocation.expectedReturn)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
