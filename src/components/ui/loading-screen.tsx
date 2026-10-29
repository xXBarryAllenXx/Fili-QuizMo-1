import { Spinner } from "@/components/ui/spinner";

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
        <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-primary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/Fili-QuizMo Logo.png"
            alt=""
            className="h-10 w-10 rounded-xl object-cover ring-1 ring-black/10"
          />
          <span>Fili-QuizMo</span>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-5 py-3 shadow-sm">
          <Spinner className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium text-neutral-600">{label}</p>
        </div>
      </div>
    </div>
  );
}
