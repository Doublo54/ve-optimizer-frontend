import { useOptimizerStore } from '../stores/optimizerStore';
import { AlertCircle, X } from 'lucide-react';
import { Button } from './ui/button';

export function ErrorDisplay() {
  const { error, setError } = useOptimizerStore();

  if (!error) return null;

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-destructive">Error</h4>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setError(null)}
          className="h-6 w-6 p-0 hover:bg-destructive/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
