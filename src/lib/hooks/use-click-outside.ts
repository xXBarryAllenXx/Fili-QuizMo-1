import { useEffect } from "react";
import type { RefObject } from "react";

export function useClickOutside(
  targetRef: RefObject<HTMLElement | null>,
  ignoredRef: RefObject<HTMLElement | null>,
  onClickOutside: () => void,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handlePointerEvent(event: MouseEvent | TouchEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        targetRef.current?.contains(target) ||
        ignoredRef.current?.contains(target)
      ) {
        return;
      }

      onClickOutside();
    }

    document.addEventListener("mousedown", handlePointerEvent);
    document.addEventListener("touchstart", handlePointerEvent, {
      passive: true,
    });

    return () => {
      document.removeEventListener("mousedown", handlePointerEvent);
      document.removeEventListener("touchstart", handlePointerEvent);
    };
  }, [enabled, ignoredRef, onClickOutside, targetRef]);
}
