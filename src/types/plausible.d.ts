// Plausible Analytics TypeScript Definitions
interface PlausibleOptions {
  props?: Record<string, string | number>;
  callback?: () => void;
}

interface Window {
  plausible?: (event: string, options?: PlausibleOptions) => void;
}

declare const plausible: (event: string, options?: PlausibleOptions) => void;
