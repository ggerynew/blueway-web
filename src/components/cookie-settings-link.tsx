'use client';

/** Lábléc-link a süti-beállítások újranyitásához (a consent kezelőt hívja). */
export function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const w = window as unknown as { BluewayConsent?: { open: () => void } };
        w.BluewayConsent?.open();
      }}
      className="w-fit text-left transition-colors hover:text-ink"
    >
      {label}
    </button>
  );
}
