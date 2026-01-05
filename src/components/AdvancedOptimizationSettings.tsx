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
    <div className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="flex flex-col gap-2">
        <label htmlFor="min-pools" className="text-sm font-medium">
          Min Pools
        </label>
        <Input
          id="min-pools"
          type="number"
          value={minPools}
          onChange={(e) => handleMinPoolsChange(e.target.value)}
          min={1}
          max={20}
          className="w-20"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="max-pools-advanced" className="text-sm font-medium">
          Max Pools
        </label>
        <Input
          id="max-pools-advanced"
          type="number"
          value={maxPoolsAdvanced}
          onChange={(e) => handleMaxPoolsAdvancedChange(e.target.value)}
          min={1}
          max={20}
          className="w-20"
        />
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        Range for advanced optimization analysis
      </p>
    </div>
  );
}
