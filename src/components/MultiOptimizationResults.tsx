import { useOptimizerStore } from '../stores/optimizerStore';
import { formatCurrency, formatLargeNumber } from '../utils/api';
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
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Advanced Optimization Results
        </CardTitle>
        <CardDescription>
          Comparison of optimization results with different maximum pool counts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Best result highlight */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
              <CheckCircle className="h-4 w-4" />
              Best Result: {bestResult.maxPools} pools
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Expected Annual Return</div>
                <div className="font-semibold text-lg">
                  {formatCurrency(bestResult.result.totalExpectedReturn)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Fee Returns</div>
                <div className="font-semibold">
                  {formatCurrency(bestResult.result.totalExpectedFeeReturn)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Bribe Returns</div>
                <div className="font-semibold">
                  {formatCurrency(bestResult.result.totalExpectedBribeReturn)}
                </div>
              </div>
            </div>
          </div>

          {/* Results table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Max Pools</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Total Return</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Fee Returns</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Bribe Returns</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Fee %</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map(({ maxPools, result }) => (
                    <tr key={maxPools} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{maxPools}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">
                          {formatLargeNumber(result.totalExpectedReturn)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(result.totalExpectedFeeReturn)}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(result.totalExpectedBribeReturn)}
                      </td>
                      <td className="px-4 py-3">
                        {result.feeSharePercentage.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant={appliedResultMaxPools === maxPools ? "default" : "outline"}
                          onClick={() => applyOptimalAllocations(result, maxPools)}
                          className={appliedResultMaxPools === maxPools ? "bg-green-600 hover:bg-green-700" : ""}
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

          <div className="text-sm text-muted-foreground">
            Results are sorted by expected annual return. The best allocation has been automatically applied.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
