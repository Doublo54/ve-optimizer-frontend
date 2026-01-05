import { useOptimizerStore } from '../stores/optimizerStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function MaxPoolsSelector() {
  const { maxPools, setMaxPools } = useOptimizerStore();

  const handleMaxPoolsChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 20) {
      setMaxPools(numValue);
    }
  };

  return (
    <div className="space-y-2.5">
      <label htmlFor="max-pools" className="text-sm font-medium text-neutral-700">Max Pools</label>
      <Select value={maxPools.toString()} onValueChange={handleMaxPoolsChange}>
        <SelectTrigger id="max-pools" className="w-full">
          <SelectValue placeholder="Select max pools" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
            <SelectItem key={num} value={num.toString()}>
              {num} {num === 1 ? 'pool' : 'pools'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-neutral-500">
        Maximum pools for optimization
      </p>
    </div>
  );
}
