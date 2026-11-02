"use client";
import { useEffect, useRef, useState } from "react";
import { ProductImage } from "@/components/catalog/ProductImage";
export function CategoryCarousel({ images, title }: { images: string[]; title: string }) {
  const [{ active, previous }, setFrame] = useState<{ active: number; previous: number | null }>({ active: 0, previous: null });
  const [paused, setPaused] = useState(false);
  const [nearViewport, setNearViewport] = useState(false);
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(entries => setNearViewport(entries.some(entry => entry.isIntersecting)), { rootMargin: "150px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (images.length < 2 || paused || !nearViewport || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setFrame(frame => ({ active: (frame.active + 1) % images.length, previous: frame.active })), 4500);
    return () => clearInterval(timer);
  }, [images.length, paused, nearViewport]);
  if (!images.length) return <div className="flex h-full items-center justify-center px-4 text-center text-sm text-brand-muted">Фото скоро появятся</div>;
  const visible = loaded.has(images[active]) ? active : previous ?? active;
  return <div ref={container} className="relative h-full w-full" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} aria-label={`Фотографии: ${title}`}>
    {images.map((src, index) => index === active || index === previous ? <div key={src} aria-hidden={index !== visible} className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${index === visible ? "opacity-100" : "opacity-0"}`}><ProductImage src={src} alt={index === visible ? title : ""} fill loading="lazy" fetchPriority="low" sizes="(max-width: 768px) 55vw, 30vw" className="object-contain" onLoad={() => setLoaded(current => current.has(src) ? current : new Set(current).add(src))} /></div> : null)}
    {images.length > 1 && <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">{images.map((_, index) => <button key={index} type="button" aria-label={`Фото ${index + 1}`} aria-pressed={index === active} onClick={() => setFrame(frame => ({ active: index, previous: frame.active }))} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80"><span className={`h-2 w-2 rounded-full ${index === active ? "bg-brand-terracotta" : "bg-brand-muted/40"}`} /></button>)}</div>}
  </div>;
}
