'use client';

import { useEffect, useState } from 'react';
import { asset } from '@/lib/asset';

export interface ProductMediaLabels {
  photo: string;
  video: string;
  view3d: string;
  demoNote: string;
  dragHint: string;
}

type Tab = 'photo' | 'video' | '3d';

export function ProductMedia({
  name,
  image,
  videoId,
  model3d,
  model3dIsDemo,
  labels,
}: {
  name: string;
  image: string;
  videoId?: string;
  model3d?: string;
  model3dIsDemo?: boolean;
  labels: ProductMediaLabels;
}) {
  const [tab, setTab] = useState<Tab>('photo');
  const [viewerReady, setViewerReady] = useState(false);

  useEffect(() => {
    if (model3d) {
      import('@google/model-viewer').then(() => setViewerReady(true));
    }
  }, [model3d]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'photo', label: labels.photo },
    ...(videoId ? [{ id: 'video' as Tab, label: labels.video }] : []),
    ...(model3d ? [{ id: '3d' as Tab, label: labels.view3d }] : []),
  ];

  return (
    <div>
      {tabs.length > 1 && (
        <div className="mb-4 flex w-fit items-center gap-1 rounded-full border border-line bg-white p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                tab === t.id
                  ? 'bg-ink text-white'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-white">
        <div
          key={tab}
          className="media-fade-in absolute inset-0"
        >
          {tab === 'photo' && (
            <div className="flex h-full items-center justify-center p-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(image)}
                alt={name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          {tab === 'video' && videoId && (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
              title={`${name} — video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}

          {tab === '3d' && model3d && (
            <>
              {viewerReady ? (
                <model-viewer
                  src={asset(model3d)}
                  alt={name}
                  loading="eager"
                  camera-controls=""
                  auto-rotate=""
                  auto-rotate-delay="1500"
                  rotation-per-second="20deg"
                  shadow-intensity="1"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-ink-muted">
                  …
                </div>
              )}
              <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-3 py-1 text-xs text-white">
                {labels.dragHint}
              </p>
              {model3dIsDemo && (
                <p className="pointer-events-none absolute top-3 left-3 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-900">
                  {labels.demoNote}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
