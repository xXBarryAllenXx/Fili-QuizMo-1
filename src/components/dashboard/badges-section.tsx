"use client";

import Image from "next/image";
import { PixelButton, PixelCard } from "@/components/ui/pixel-primitives";
import { useAchievements } from "@/lib/dashboard/use-achievements";

/** Loads only when opened, using the mobile app's saved awards and artwork. */
export function BadgesSection() {
  const { achievements, error, retry } = useAchievements();

  const earned = achievements?.filter((item) => item.unlockedAt !== null).length ?? 0;

  return (
    <section aria-labelledby="achievements-heading" className="space-y-4">
      <header className="text-center">
        <h2 id="achievements-heading" className="text-xl font-bold text-foreground">Achievements</h2>
        {achievements ? <p className="mt-1 text-sm text-px-muted">{earned} of {achievements.length} unlocked</p> : null}
      </header>
      {error ? (
        <PixelCard className="text-center">
          <p role="alert" className="text-sm">{error}</p>
          <PixelButton className="mt-3" onClick={retry} icon="RefreshCw">Retry</PixelButton>
        </PixelCard>
      ) : achievements === null ? (
        <p role="status" className="py-8 text-center text-sm text-px-muted">Loading achievements...</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {achievements.map((item) => {
            const unlocked = item.unlockedAt !== null;
            return (
              <li key={item.id}>
                <PixelCard as="article" className="flex h-full flex-col gap-3">
                  <Image
                    src={`/assets/achievements/${item.id}_${unlocked ? "unlocked" : "locked"}.png`}
                    alt={`${item.name}: ${unlocked ? "unlocked" : "locked"}`}
                    width={132}
                    height={132}
                    className="mx-auto h-[132px] w-full object-contain"
                  />
                  <h3 className="text-center text-base font-bold">{item.name}</h3>
                  <p className="text-sm text-px-muted">{item.requirement}</p>
                  <p className={`mt-auto border-t-2 border-ink/15 pt-3 text-sm font-semibold ${unlocked ? "text-foreground" : "text-px-muted"}`}>
                    {item.unlockedAt ? <>Unlocked &bull; <time dateTime={item.unlockedAt}>{new Date(item.unlockedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</time></> : <>Locked &bull; {item.progress}</>}
                  </p>
                </PixelCard>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
