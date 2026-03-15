'use client';

import { useEffect, useRef } from 'react';

export function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const el = ref.current;
    if (el) {
      // Observe self
      if (el.classList.contains('animate-on-scroll')) {
        observer.observe(el);
      }
      // Observe children
      el.querySelectorAll('.animate-on-scroll').forEach((child) => {
        observer.observe(child);
      });
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}
