import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <Skeleton className="w-full h-full rounded-lg" />
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-500">Analyzing your dental scan...</p>
        <p className="text-xs text-gray-400">This may take a few moments</p>
      </div>
    </div>
  );
}