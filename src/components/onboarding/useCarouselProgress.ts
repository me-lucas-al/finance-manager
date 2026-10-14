'use client';

import { useEffect, useState } from 'react';
import type { CarouselApi } from '@/components/ui/carousel';

export function useCarouselProgress(stepCount: number) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const syncCurrent = () => setCurrent(api.selectedScrollSnap());
    syncCurrent();
    api.on('select', syncCurrent);
    api.on('reInit', syncCurrent);
    return () => {
      api.off('select', syncCurrent);
      api.off('reInit', syncCurrent);
    };
  }, [api]);

  return {
    setApi,
    current,
    isFirst: current === 0,
    isLast: current === stepCount - 1,
    progressPercent: ((current + 1) / stepCount) * 100,
    scrollPrev: () => api?.scrollPrev(),
    scrollNext: () => api?.scrollNext(),
    scrollTo: (index: number) => api?.scrollTo(index),
  };
}
