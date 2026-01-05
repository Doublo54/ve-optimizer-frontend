import { useOptimizerStore } from '../stores/optimizerStore';
import { formatCurrency } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { TrendingUp, CheckCircle } from 'lucide-react';

export function MultiOptimizationResults() {
  const { multiOptimizationResults, applyOptimalAllocations, appliedResultMaxPools } = useOptimizerStore();

  if (multiOptimizationResults.length === 0) {
    return null;
  }

  // Sort by expected return (highest first)
  const sortedResults = [...multiOptimizationResults].sort(
    (a, b) => b.result.totalExpectedReturn - a.result.totalExpectedReturn
  );

  const bestResult = sortedResults[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-100">
            <TrendingUp className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <CardTitle>Advanced Optimization Results</CardTitle>
            <CardDescription className="mt-1">
              Comparison of optimization results with different maximum pool counts
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Best result highlight */}
        <div className="p-6 bg-green-50 border-2 border-green-300 rounded-xl">
          <div className="flex items-center gap-2 text-green-900 font-semibold mb-4">
            <CheckCircle className="h-5 w-5" />
            Best Result: {bestResult.maxPools} pools
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-green-700 font-medium mb-1">Expected Annual Return</div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(bestResult.result.totalExpectedReturn)}
              </div>
            </div>
            <div>
              <div className="text-sm text-green-700 font-medium mb-1">Fee Returns</div>
              <div className="text-xl font-semibold text-green-800">
                {formatCurrency(bestResult.result.totalExpectedFeeReturn)}
              </div>
            </div>
            <div>
              <div className="text-sm text-green-700 font-medium mb-1">Bribe Returns</div>
              <div className="text-xl font-semibold text-green-800">
                {formatCurrency(bestResult.result.totalExpectedBribeReturn)}
              </div>
            </div>
          </div>
        </div>

        {/* Results table */}
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Max Pools</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Total Return</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Fee Returns</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Bribe Returns</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Fee %</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {sortedResults.map(({ maxPools, result }) => (
                  <tr key={maxPools} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-neutral-900">{maxPools}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900">
                        {formatCurrency(result.totalExpectedReturn)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">
                      {formatCurrency(result.totalExpectedFeeReturn)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">
                      {formatCurrency(result.totalExpectedBribeReturn)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                      {result.feeSharePercentage.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant={appliedResultMaxPools === maxPools ? "default" : "outline"}
                        onClick={() => applyOptimalAllocations(result, maxPools)}
                        className={appliedResultMaxPools === maxPools ? "!bg-green-600 hover:!bg-green-700 !text-white" : ""}
                      >
                        {appliedResultMaxPools === maxPools ? "Applied" : "Apply"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-sm text-neutral-600">
          Results are sorted by expected annual return. The best allocation has been automatically applied.
        </p>
      </CardContent>
    </Card>
  );
}
