import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOptimizerStore } from '../stores/optimizerStore';
import { fetchPools, formatCurrency, formatLargeNumber, formatPercentage } from '../utils/api';
import { Pool } from '../types/api';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loading } from './ui/loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Ban, ChevronUp, ChevronDown } from 'lucide-react';

type SortField = 'apr' | 'tvl' | 'rewards' | 'title';
type SortDirection = 'asc' | 'desc';

export function PoolList() {
  const {
    selectedChain,
    selectedPools,
    poolAllocations,
    blacklistedPools,
    togglePoolSelection,
    setPoolAllocation,
    toggleBlacklist,
  } = useOptimizerStore();

  const [sortField, setSortField] = useState<SortField>('rewards');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [minRewardsFilter, setMinRewardsFilter] = useState<number>(300);

  const { data: pools = [], isLoading, error } = useQuery({
    queryKey: ['pools', selectedChain],
    queryFn: () => fetchPools(selectedChain),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handlePercentageChange = (poolAddress: string, value: string) => {
    const percentage = parseFloat(value);
    if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      setPoolAllocation(poolAddress, percentage);
      
      // Auto-select pool if percentage > 0, deselect if percentage === 0
      const isCurrentlySelected = selectedPools.includes(poolAddress);
      if (percentage > 0 && !isCurrentlySelected) {
        togglePoolSelection(poolAddress);
      } else if (percentage === 0 && isCurrentlySelected) {
        togglePoolSelection(poolAddress);
      }
    }
  };

  const totalAllocation = Object.values(poolAllocations).reduce((sum, pct) => sum + pct, 0);

  // Sort and filter pools
  const filteredAndSortedPools = useMemo(() => {
    let filtered = pools.filter(pool => {
      const totalRewards = (pool.gauge?.feeInUsd || 0) + (pool.gauge?.bribesInUsd || 0);
      return totalRewards >= minRewardsFilter;
    });

    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'apr':
          aValue = a.gauge?.votingAprProjection || 0;
          bValue = b.gauge?.votingAprProjection || 0;
          break;
        case 'tvl':
          aValue = a.gauge?.tvl || 0;
          bValue = b.gauge?.tvl || 0;
          break;
        case 'rewards':
          aValue = (a.gauge?.feeInUsd || 0) + (a.gauge?.bribesInUsd || 0);
          bValue = (b.gauge?.feeInUsd || 0) + (b.gauge?.bribesInUsd || 0);
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [pools, sortField, sortDirection, minRewardsFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loading text="Loading pools..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-danger-600">
          Failed to load pools. Please try again.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Available Pools</CardTitle>
            <CardDescription className="mt-1">Select and allocate your voting power</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="min-rewards" className="text-sm font-medium text-neutral-700 whitespace-nowrap">Min Rewards:</label>
              <Input
                id="min-rewards"
                type="number"
                value={minRewardsFilter}
                onChange={(e) => setMinRewardsFilter(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-28"
                min="0"
                step="0.01"
              />
            </div>
            <div className="text-sm">
              <span className="font-medium text-neutral-700">Total: {totalAllocation.toFixed(1)}%</span>
              {totalAllocation !== 100 && (
                <span className="text-danger-600 ml-2 font-medium">
                  (must equal 100%)
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-y border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Select</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold uppercase hover:text-sky-600"
                    onClick={() => handleSort('title')}
                  >
                    Pool
                    {getSortIcon('title')}
                  </Button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold uppercase hover:text-sky-600"
                    onClick={() => handleSort('apr')}
                  >
                    APR
                    {getSortIcon('apr')}
                  </Button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold uppercase hover:text-sky-600"
                    onClick={() => handleSort('tvl')}
                  >
                    TVL
                    {getSortIcon('tvl')}
                  </Button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold uppercase hover:text-sky-600"
                    onClick={() => handleSort('rewards')}
                  >
                    Rewards (24h)
                    {getSortIcon('rewards')}
                  </Button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Allocation %</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredAndSortedPools.map((pool) => {
                const isSelected = selectedPools.includes(pool.address);
                const isBlacklisted = blacklistedPools.has(pool.address);
                const allocation = poolAllocations[pool.address] || 0;
                const totalRewards = (pool.gauge?.feeInUsd || 0) + (pool.gauge?.bribesInUsd || 0);

                return (
                  <tr key={pool.address} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked !== 'indeterminate') {
                            togglePoolSelection(pool.address);
                          }
                        }}
                        disabled={isBlacklisted}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        <div className="font-medium text-neutral-900">
                          {pool.title}
                        </div>
                        <div className="text-xs text-neutral-500 font-mono mt-0.5">
                          {pool.address.slice(0, 6)}...{pool.address.slice(-4)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                      {formatPercentage(pool.gauge?.votingAprProjection || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">
                      {formatLargeNumber(pool.gauge?.tvl || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                      {formatCurrency(totalRewards)}
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        value={allocation}
                        onChange={(e) => handlePercentageChange(pool.address, e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-24"
                        disabled={isBlacklisted}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant={isBlacklisted ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => toggleBlacklist(pool.address)}
                        className="w-9 h-9 p-0"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredAndSortedPools.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            {pools.length === 0 ? `No pools found for ${selectedChain}` : 'No pools match the current filters'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
