"use client";

import Image from "next/image";
import { PixelButton, PixelCard } from "@/components/ui/pixel-primitives";
import { Button } from "@/components/ui/button";
import { nextAchievement } from "@/lib/dashboard/achievements";
import { useAchievements } from "@/lib/dashboard/use-achievements";

/** The overview's badge card: what is earned and how close the next one is. */
export function BadgesPreview({ onViewAll }: { onViewAll: () => void }) {
  const { achievements, error, retry } = useAchievements();

  return (
    <section aria-labelledby="student-badges-title">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3
          id="student-badges-title"
          className="min-w-0 text-base font-semibold text-foreground"
        >
          Badges
        </h3>
        <Button
          type="button"
          variant="accent"
          size="sm"
          className="shrink-0 whitespace-nowrap"
          onClick={onViewAll}
          icon="Eye"
        >
          View all
        </Button>
      </div>

      {error ? (
        <PixelCard>
          <p role="alert" className="text-sm">{error}</p>
          <PixelButton className="mt-3" onClick={retry} icon="RefreshCw">Retry</PixelButton>
        </PixelCard>
      ) : achievements === null ? (
        <p role="status" className="text-sm">Loading your badges...</p>
      ) : (
        <BadgesPreviewCard achievements={achievements} />
      )}
    </section>
  );
}

function BadgesPreviewCard({
  achievements,
}: {
  achievements: NonNullable<ReturnType<typeof useAchievements>["achievements"]>;
}) {
  const earned = achievements.filter((item) => item.unlockedAt !== null);
  const next = nextAchievement(achievements);
  const percent = next ? Math.round(next.fraction * 100) : 100;

  return (
    <PixelCard as="article" className="space-y-3">
      <div className="flex items-center gap-3">
        <ul className="flex flex-wrap gap-2" aria-label="Badges you have earned">
          {earned.map((item) => (
            <li key={item.id}>
              <Image
                src={`/assets/achievements/${item.id}_unlocked.png`}
                alt={`${item.name}: unlocked`}
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
            </li>
          ))}
        </ul>
        <p className="text-sm text-px-muted">
          {earned.length === 0
            ? "No badges yet. Finish a quiz to earn your first."
            : `${earned.length} of ${achievements.length} unlocked`}
        </p>
      </div>

      {next ? (
        <div className="border-t-2 border-ink/15 pt-3">
          <p className="text-sm font-semibold text-foreground">
            Next: {next.name}
          </p>
          <div
            role="progressbar"
            aria-label={`Progress toward ${next.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="mt-2 h-3 border-2 border-ink bg-surface"
          >
            <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1 text-xs text-px-muted">
            {next.progress}
          </p>
        </div>
      ) : (
        <p className="border-t-2 border-ink/15 pt-3 text-sm font-semibold text-foreground">
          You unlocked every badge. Nice work!
        </p>
      )}
    </PixelCard>
  );
}
