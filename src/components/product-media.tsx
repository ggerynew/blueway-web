'use client';

import { useEffect, useState } from 'react';
import { asset } from '@/lib/asset';
import { ProductThumb } from '@/components/product-thumb';
import { ZoomableImage } from '@/components/zoomable-image';

export interface ProductMediaLabels {
  photo: string;
  video: string;
  view3d: string;
  demoNote: string;
  dragHint: string;
  /** „Kép nagyítása" — a fotó gombként viselkedik, ez mondja meg, mit tesz. */
  imageZoom: string;
  imageClose: string;
}

/** A videófülek azonosítója sorszámozott: 'video-0', 'video-1', … */
type Tab = 'photo' | '3d' | `video-${number}`;

/** Egy videó a fülsoron: a YouTube-azonosító és — ha van — a saját címe. */
export interface ProductVideo {
  videoId: string;
  /** Mit mutat ez a videó. Csak a kiegészítő videóknak van, a fő videónak nincs. */
  label?: string;
}

export function ProductMedia({
  name,
  image,
  videoId,
  extraVideos,
  model3d,
  model3dIsDemo,
  labels,
}: {
  name: string;
  image?: string;
  videoId?: string;
  /** További videók a fő videó mellé — mindegyik saját fület kap. */
  extraVideos?: ProductVideo[];
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

  // A fő videó és a kiegészítők egyetlen listát alkotnak: a látogató
  // szempontjából mind ugyanolyan videó, csak mást mutatnak.
  const videok: ProductVideo[] = [
    ...(videoId ? [{ videoId }] : []),
    ...(extraVideos ?? []),
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: 'photo', label: labels.photo },
    // Egy videónál a felirat marad „Videó”. Többnél sorszámozunk, mert
    // három egyforma „Videó” fül között nem lehet választani.
    ...videok.map((_, i) => ({
      id: `video-${i}` as Tab,
      label: videok.length > 1 ? `${labels.video} ${i + 1}` : labels.video,
    })),
    ...(model3d ? [{ id: '3d' as Tab, label: labels.view3d }] : []),
  ];

  const aktivVideo = tab.startsWith('video-') ? videok[Number(tab.slice(6))] : undefined;

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
            // A fotó ugyanolyan szürke csempén ül, mint a terméklista
            // kártyáin — eddig fehér háttéren állt, és emiatt lógott ki az
            // egységes képből. A behúzás összege (3+5) megegyezik a korábbi
            // p-8-cal, tehát a kép mérete nem változott.
            <div className="h-full p-3">
              {image ? (
                <ZoomableImage
                  src={image}
                  alt={name}
                  nagyitasFelirat={labels.imageZoom}
                  bezarasFelirat={labels.imageClose}
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl bg-surface p-5">
                  <ProductThumb image={undefined} name={name} />
                </div>
              )}
            </div>
          )}

          {aktivVideo && (
            <>
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${aktivVideo.videoId}?rel=0`}
                title={aktivVideo.label ? `${name} — ${aktivVideo.label}` : `${name} — video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              {/* A sorszám nem mondja meg, mit mutat a videó — a saját címe
                  igen. Ezért a kiegészítő videóknál az is kiírjuk. */}
              {aktivVideo.label && (
                <p className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-3 py-1 text-xs text-white">
                  {aktivVideo.label}
                </p>
              )}
            </>
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
