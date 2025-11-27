import { Button } from "@/components/ui/button";

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center gap-3">
      <div className="text-red-500 font-medium">{error}</div>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Clear
        </Button>
        <Button size="sm" onClick={onRetry}>
          Try Again
        </Button>
      </div>
    </div>
  );
}