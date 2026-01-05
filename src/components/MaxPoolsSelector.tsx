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
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Max Pools</label>
      <Select value={maxPools.toString()} onValueChange={handleMaxPoolsChange}>
        <SelectTrigger className="w-full">
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
      <p className="text-xs text-muted-foreground">
        Maximum number of pools to include in optimization
      </p>
    </div>
  );
}
