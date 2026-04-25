/**
 * Performance Optimization Utilities - Rainblur Theme
 * Font loading optimization, CSS minification config, and animation utilities
 */

/**
 * Font Loading Optimization
 * Adds preconnect and preload hints for font loading
 */

export interface FontPreloadConfig {
  fontUrl: string;
  fontType: 'woff2' | 'woff' | 'ttf' | 'otf';
  fontDisplay?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

export interface FontPreconnectConfig {
  origin: string;
  crossorigin?: boolean;
}

/**
 * Adds preconnect hint for font sources
 * Should be called during app initialization
 */
export function addFontPreconnect(config: FontPreconnectConfig): void {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = config.origin;
  
  if (config.crossorigin) {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
}

/**
 * Adds preload hint for specific font files
 * Should be called during app initialization
 */
export function addFontPreload(config: FontPreloadConfig): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = config.fontUrl;
  link.as = 'font';
  link.type = `font/${config.fontType}`;
  link.crossOrigin = 'anonymous';
  
  document.head.appendChild(link);
}

/**
 * Adds font-face definition dynamically
 * Useful for runtime font loading
 */
export function addFontFace(fontFamily: string, fontUrl: string, fontWeight: number | string, fontDisplay: 'swap' = 'swap'): void {
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: '${fontFamily}';
      src: url('${fontUrl}') format('woff2');
      font-weight: ${fontWeight};
      font-display: ${fontDisplay};
    }
  `;
  document.head.appendChild(style);
}

/**
 * Detects font loading status
 * Returns a promise that resolves when fonts are loaded
 */
export function waitForFonts(timeout: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const fontLoadPromise = document.fonts.ready;
    
    const timeoutId = setTimeout(() => {
      reject(new Error('Font loading timeout'));
    }, timeout);
    
    fontLoadPromise
      .then(() => {
        clearTimeout(timeoutId);
        resolve();
      })
      .catch(() => {
        clearTimeout(timeoutId);
        resolve(); // Resolve anyway to prevent blocking
      });
  });
}

/**
 * Checks if fonts are loaded
 */
export function areFontsLoaded(): boolean {
  return document.fonts.check('12px Inter');
}

/**
 * CSS Minification Configuration for Production
 * These settings are used in the build configuration
 */

export interface CSSMinificationConfig {
  // CSSNano options
  preset?: 'default' | 'advanced' | 'classic';
  discardComments?: boolean;
  discardDuplicates?: boolean;
  mergeIdents?: boolean;
  reduceIdents?: boolean;
  normalizeWhitespace?: boolean;
  reduceTransforms?: boolean;
  mergeRules?: boolean;
  nonProperties?: boolean;
  uniqueSelectors?: boolean;
}

export const defaultCSSMinificationConfig: CSSMinificationConfig = {
  preset: 'advanced',
  discardComments: true,
  discardDuplicates: true,
  mergeIdents: true,
  reduceIdents: true,
  normalizeWhitespace: true,
  reduceTransforms: true,
  mergeRules: true,
  nonProperties: true,
  uniqueSelectors: true,
};

/**
 * Critical CSS Extraction Configuration
 * Defines which CSS should be inlined for above-the-fold content
 */

export interface CriticalCSSConfig {
  // Viewport dimensions for critical CSS extraction
  viewport?: {
    width: number;
    height: number;
  };
  // CSS selectors to prioritize
  criticalSelectors?: string[];
  // CSS selectors to exclude
  excludeSelectors?: string[];
  // Inline critical CSS in HTML head
  inline?: boolean;
  // Extract to separate file
  extract?: boolean;
}

export const defaultCriticalCSSConfig: CriticalCSSConfig = {
  viewport: {
    width: 1920,
    height: 1080,
  },
  criticalSelectors: [
    '.font-sans',
    '.font-mono',
    '.text-xs',
    '.text-sm',
    '.text-base',
    '.text-lg',
    '.text-xl',
    '.text-2xl',
    '.text-3xl',
    '.text-4xl',
    '.text-5xl',
    '.text-6xl',
    '.text-7xl',
    '.text-8xl',
    '.text-9xl',
    '.leading-tight',
    '.leading-snug',
    '.leading-normal',
    '.leading-relaxed',
    '.leading-loose',
    '.tracking-tighter',
    '.tracking-tight',
    '.tracking-normal',
    '.tracking-wide',
    '.tracking-wider',
    '.tracking-widest',
    '.font-light',
    '.font-normal',
    '.font-medium',
    '.font-semibold',
    '.font-bold',
    '.bg-primary',
    '.bg-secondary',
    '.bg-surface',
    '.text-primary',
    '.text-secondary',
    '.text-muted',
    '.accent-green',
    '.accent-teal',
    '.accent-pink',
    '.accent-purple',
    '.btn',
    '.btn-primary',
    '.btn-secondary',
    '.btn-ghost',
    '.btn-sm',
    '.btn-md',
    '.btn-lg',
    '.input',
    '.input:focus',
    '.input-error',
    '.input:disabled',
    '.input-sm',
    '.input-md',
    '.input-lg',
    '.card',
    '.card-hoverable',
    '.card-content',
    '.card-header',
    '.card-footer',
    '.gradient-text',
    '.gradient-green',
    '.gradient-teal',
    '.gradient-pink',
    '.gradient-purple',
    '.gradient-blue',
    '.focus-visible',
    '.sr-only',
    '.visually-hidden',
    '.skip-link',
    '.glass-card',
    '.glass-btn',
  ],
  excludeSelectors: [
    '.animate-*',
    '.perf-*',
    '.lazy-load',
    '.eager-load',
  ],
  inline: true,
  extract: true,
};

/**
 * Animation Performance Settings
 * GPU-accelerated properties and reduced motion support
 */

export interface AnimationConfig {
  // Use GPU-accelerated properties
  useGPUAcceleration?: boolean;
  // Properties to animate for GPU acceleration
  gpuProperties?: string[];
  // Reduced motion support
  prefersReducedMotion?: boolean;
  // Default animation duration
  defaultDuration?: number;
  // Default easing
  defaultEasing?: string;
}

export const defaultAnimationConfig: AnimationConfig = {
  useGPUAcceleration: true,
  gpuProperties: ['transform', 'opacity', 'filter', 'backdrop-filter'],
  prefersReducedMotion: true,
  defaultDuration: 300,
  defaultEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

/**
 * Checks if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Gets animation duration based on user preferences
 */
export function getAnimationDuration(config: AnimationConfig = defaultAnimationConfig): number {
  if (config.prefersReducedMotion && prefersReducedMotion()) {
    return 1; // Minimal duration for reduced motion
  }
  return config.defaultDuration;
}

/**
 * Gets animation easing based on user preferences
 */
export function getAnimationEasing(config: AnimationConfig = defaultAnimationConfig): string {
  if (config.prefersReducedMotion && prefersReducedMotion()) {
    return 'linear';
  }
  return config.defaultEasing;
}

/**
 * Gets GPU-accelerated transform style
 */
export function getGPUTransform(properties: string[] = defaultAnimationConfig.gpuProperties): string {
  if (!defaultAnimationConfig.useGPUAcceleration) {
    return '';
  }
  
  const transforms = properties
    .filter(prop => ['transform', 'opacity', 'filter', 'backdrop-filter'].includes(prop))
    .map(prop => `${prop}: 0`)
    .join('; ');
  
  return `will-change: ${properties.join(', ')}; ${transforms}`;
}

/**
 * Gets animation keyframes with GPU acceleration
 */
export function getGPUKeyframes(name: string, from: Record<string, string>, to: Record<string, string>): string {
  return `
    @keyframes ${name} {
      from {
        ${Object.entries(from)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ')}
        transform: translateZ(0);
      }
      to {
        ${Object.entries(to)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ')}
        transform: translateZ(0);
      }
    }
  `;
}

/**
 * Performance Monitoring Utilities
 */

export interface PerformanceMetrics {
  fontLoadTime: number;
  cssLoadTime: number;
  firstPaintTime: number;
  firstContentfulPaintTime: number;
  timeToInteractive: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fontLoadTime: 0,
    cssLoadTime: 0,
    firstPaintTime: 0,
    firstContentfulPaintTime: 0,
    timeToInteractive: 0,
  };

  /**
   * Starts monitoring font loading
   */
  startFontMonitoring(): void {
    this.metrics.fontLoadTime = performance.now();
  }

  /**
   * Ends font monitoring and records time
   */
  endFontMonitoring(): number {
    this.metrics.fontLoadTime = performance.now() - this.metrics.fontLoadTime;
    return this.metrics.fontLoadTime;
  }

  /**
   * Starts monitoring CSS loading
   */
  startCSSMonitoring(): void {
    this.metrics.cssLoadTime = performance.now();
  }

  /**
   * Ends CSS monitoring and records time
   */
  endCSSMonitoring(): number {
    this.metrics.cssLoadTime = performance.now() - this.metrics.cssLoadTime;
    return this.metrics.cssLoadTime;
  }

  /**
   * Gets all performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Resets all metrics
   */
  reset(): void {
    this.metrics = {
      fontLoadTime: 0,
      cssLoadTime: 0,
      firstPaintTime: 0,
      firstContentfulPaintTime: 0,
      timeToInteractive: 0,
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
