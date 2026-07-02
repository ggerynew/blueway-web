import type * as React from 'react';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            src?: string;
            alt?: string;
            'camera-controls'?: boolean | '';
            'auto-rotate'?: boolean | '';
            'auto-rotate-delay'?: number | string;
            'rotation-per-second'?: string;
            'shadow-intensity'?: number | string;
            'camera-orbit'?: string;
            'field-of-view'?: string;
            exposure?: number | string;
            poster?: string;
            loading?: 'auto' | 'lazy' | 'eager';
          },
          HTMLElement
        >;
      }
    }
  }
}

export {};
