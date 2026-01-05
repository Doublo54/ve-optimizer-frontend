import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOptimizerStore } from '../stores/optimizerStore';
import { fetchPools, formatCurrency, formatLargeNumber, formatPercentage } from '../utils/api';
import { Pool } from '../types/api';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loading } from './ui/loading';
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
      <div className="flex items-center justify-center py-8">
        <Loading text="Loading pools..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Failed to load pools. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Available Pools</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Min Rewards:</label>
            <Input
              type="number"
              value={minRewardsFilter}
              onChange={(e) => setMinRewardsFilter(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-24"
              min="0"
              step="0.01"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total allocation: {totalAllocation.toFixed(1)}%
            {totalAllocation !== 100 && (
              <span className="text-destructive ml-1">
                (must equal 100%)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Select</th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('title')}
                  >
                    Pool
                    {getSortIcon('symbol')}
                  </Button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('apr')}
                  >
                    APR
                    {getSortIcon('apr')}
                  </Button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('tvl')}
                  >
                    TVL
                    {getSortIcon('tvl')}
                  </Button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('rewards')}
                  >
                    Rewards (24h)
                    {getSortIcon('rewards')}
                  </Button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Allocation %</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPools.map((pool) => {
                const isSelected = selectedPools.includes(pool.address);
                const isBlacklisted = blacklistedPools.has(pool.address);
                const allocation = poolAllocations[pool.address] || 0;
                const totalRewards = (pool.gauge?.feeInUsd || 0) + (pool.gauge?.bribesInUsd || 0);

                return (
                  <tr key={pool.address} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => togglePoolSelection(pool.address)}
                        disabled={isBlacklisted}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">
                          {pool.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {pool.address.slice(0, 6)}...{pool.address.slice(-4)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {formatPercentage(pool.gauge?.votingAprProjection || 0)}
                    </td>
                    <td className="px-4 py-3">
                      {formatLargeNumber(pool.gauge?.tvl || 0)}
                    </td>
                    <td className="px-4 py-3">
                      {formatCurrency(totalRewards)}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        value={allocation}
                        onChange={(e) => handlePercentageChange(pool.address, e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-20"
                        disabled={!isSelected}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant={isBlacklisted ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => toggleBlacklist(pool.address)}
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
      </div>

      {filteredAndSortedPools.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {pools.length === 0 ? `No pools found for ${selectedChain}` : 'No pools match the current filters'}
        </div>
      )}
    </div>
  );
}
