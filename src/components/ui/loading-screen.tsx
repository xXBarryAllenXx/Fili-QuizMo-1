import { Spinner } from "@/components/ui/spinner";
import { BrandLogo } from "@/components/layout/brand-logo";

type LoadingScreenProps = {
  label?: string;
  fullScreen?: boolean;
  className?: string;
};

export function LoadingScreen({
  label = "Loading...",
  fullScreen = false,
  className = "",
}: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center bg-background px-4 py-16 ${
        fullScreen ? "min-h-screen" : "min-h-[60vh]"
      } ${className}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center text-primary">
          <BrandLogo className="h-14 w-56" />
        </div>

        <div className="mt-6 flex items-center gap-3 border border-neutral-200 bg-white px-5 py-3 shadow-sm">
          <Spinner className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium text-neutral-600">{label}</p>
        </div>
      </div>
    </div>
  );
}
