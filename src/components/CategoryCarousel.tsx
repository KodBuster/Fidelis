"use client";
import { useEffect, useState } from "react";
import { ProductImage } from "@/components/catalog/ProductImage";
export function CategoryCarousel({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (images.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setActive(i => (i + 1) % images.length), 4500);
    return () => clearInterval(timer);
  }, [images.length, paused]);
  if (!images.length) return <div className="flex h-full items-center justify-center px-4 text-center text-sm text-brand-muted">Фото скоро появятся</div>;
  return <div className="relative h-full w-full" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} aria-label={`Фотографии: ${title}`}>
    {images.map((src, index) => <div key={src} aria-hidden={index !== active} className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${index === active ? "opacity-100" : "opacity-0"}`}><ProductImage src={src} alt={index === active ? title : ""} fill sizes="(max-width: 768px) 55vw, 30vw" className="object-contain" /></div>)}
    {images.length > 1 && <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">{images.map((_, index) => <button key={index} type="button" aria-label={`Фото ${index + 1}`} aria-pressed={index === active} onClick={() => setActive(index)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80"><span className={`h-2 w-2 rounded-full ${index === active ? "bg-brand-terracotta" : "bg-brand-muted/40"}`} /></button>)}</div>}
  </div>;
}
