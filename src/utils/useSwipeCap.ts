import type { LegendListRef } from '@legendapp/list/react-native';
import { useCallback, useRef, type RefObject } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/**
 * Caps a horizontal paged list to one page per swipe.
 *
 * LegendList snaps in JS and ignores the native `disableIntervalMomentum`, so a
 * fast fling can cross several pages. This records the page a drag starts from
 * and, once momentum settles, snaps back to at most ±1 page from it. Gentle
 * one-page swipes never overshoot, so they're untouched; only hard flings get
 * reined in. Pass `enabled = false` to allow free multi-page momentum.
 */
export function useSwipeCap(
  listRef: RefObject<LegendListRef | null>,
  pageWidth: number,
  enabled: boolean,
) {
  const dragStartIndexRef = useRef(0);

  const onScrollBeginDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      dragStartIndexRef.current = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    },
    [pageWidth],
  );

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!enabled) return;
      const landed = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      const start = dragStartIndexRef.current;
      const capped = Math.max(start - 1, Math.min(start + 1, landed));
      if (capped !== landed) {
        listRef.current?.scrollToIndex({ index: capped, animated: true });
      }
    },
    [enabled, pageWidth, listRef],
  );

  return { onScrollBeginDrag, onMomentumScrollEnd };
}
