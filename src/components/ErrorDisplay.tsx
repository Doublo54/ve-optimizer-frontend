import { useOptimizerStore } from '../stores/optimizerStore';
import { AlertCircle, X } from 'lucide-react';
import { Button } from './ui/button';

export function ErrorDisplay() {
  const { error, setError } = useOptimizerStore();

  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-red-900 mb-1">Error</h4>
          <p className="text-sm text-red-700 leading-relaxed">{error}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setError(null)}
          className="flex-shrink-0 h-8 w-8 p-0 hover:bg-red-100 text-red-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
