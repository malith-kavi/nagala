const reducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

/** The `behavior` for scrollTo / scrollIntoView: smooth, unless the device asks for reduced motion. */
export const scrollBehavior = () => (reducedMotion?.matches ? 'auto' : 'smooth');
