import { useOptimizerStore } from '../stores/optimizerStore';
import { Input } from './ui/input';

export function AdvancedOptimizationSettings() {
  const { minPools, maxPoolsAdvanced, setMinPools, setMaxPoolsAdvanced } = useOptimizerStore();

  const handleMinPoolsChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 20) {
      setMinPools(numValue);
    }
  };

  const handleMaxPoolsAdvancedChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 20) {
      setMaxPoolsAdvanced(numValue);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-neutral-100 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-neutral-900 mb-4">Advanced Optimization Settings</h3>
      <div className="flex flex-col sm:flex-row gap-6 items-end">
        <div className="flex flex-col gap-2.5 flex-1">
          <label htmlFor="min-pools" className="text-sm font-medium text-neutral-700">
            Min Pools
          </label>
          <Input
            id="min-pools"
            type="number"
            value={minPools}
            onChange={(e) => handleMinPoolsChange(e.target.value)}
            min={1}
            max={20}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-2.5 flex-1">
          <label htmlFor="max-pools-advanced" className="text-sm font-medium text-neutral-700">
            Max Pools
          </label>
          <Input
            id="max-pools-advanced"
            type="number"
            value={maxPoolsAdvanced}
            onChange={(e) => handleMaxPoolsAdvancedChange(e.target.value)}
            min={1}
            max={20}
            className="w-full"
          />
        </div>
        <p className="text-xs text-neutral-600 pb-2 flex-1">
          Range for advanced optimization analysis
        </p>
      </div>
    </div>
  );
}
