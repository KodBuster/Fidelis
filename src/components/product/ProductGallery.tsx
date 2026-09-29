"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ProductImage } from "@/components/catalog/ProductImage";
import { CompareButton } from "@/components/compare/CompareButton";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { useCart } from "@/context/CartContext";
import { trackAddToCart } from "@/lib/analytics/metrika";
import { formatPrice, type CategorySlug } from "@/lib/products";
import { formatInsertMassLabel } from "@/lib/synthetic-diamond-labels";
import { useProductSelection } from "./ProductSelectionContext";

type GallerySlide =
  | { type: "image"; src: string }
  | { type: "video"; src: string };

type ProductGalleryProps = {
  images: string[];
  name: string;
  videoUrl?: string;
  slug: string;
  price: number;
  productImage: string;
  category: CategorySlug;
  stoneWeight: number;
  stoneLabel: string;
  inStock?: boolean;
};

type GalleryVideoProps = {
  src: string;
  label: string;
  className?: string;
  preload?: "auto" | "metadata";
  playing: boolean;
};

type GalleryLayoutProps = {
  slides: GallerySlide[];
  name: string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  thumbClassName: string;
  mainClassName: string;
  mainObjectFit: "cover" | "contain";
  mainImageSizes: string;
  thumbImageSizes: string;
  mainPriority?: boolean;
  onMainClick?: () => void;
  thumbListClassName?: string;
};

const MODAL_ICON_BUTTON_CLASS =
  "opacity-100 bg-brand-sand text-brand-olive-dark hover:text-brand-terracotta w-11 h-11";

function GalleryVideo({
  src,
  label,
  className = "",
  preload = "auto",
  playing,
}: GalleryVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    if (!playing) {
      video.pause();
      return;
    }

    const play = () => {
      const promise = video.play();
      if (promise) {
        promise.catch(() => {
          // Browser may block autoplay until interaction.
        });
      }
    };

    play();

    if (video.readyState < 2) {
      video.addEventListener("loadeddata", play, { once: true });
      return () => video.removeEventListener("loadeddata", play);
    }
  }, [src, playing]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      preload={preload}
      className={className}
      aria-label={label}
    />
  );
}

type GalleryThumbnailsProps = {
  slides: GallerySlide[];
  name: string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  thumbClassName: string;
  thumbImageSizes: string;
  isVideoActive: boolean;
  thumbListClassName?: string;
};

function GalleryThumbnails({
  slides,
  name,
  activeIndex,
  onActiveIndexChange,
  thumbClassName,
  thumbImageSizes,
  isVideoActive,
  thumbListClassName = "max-h-full",
}: GalleryThumbnailsProps) {
  if (slides.length <= 1) return null;

  return (
    <div
      className={`flex shrink-0 flex-col gap-3 overflow-y-auto py-0.5 pr-0.5 ${thumbListClassName}`}
    >
      {slides.map((slide, index) => (
        <button
          key={
            slide.type === "video"
              ? `video-${slide.src}`
              : `${slide.src}-${index}`
          }
          type="button"
          onClick={() => onActiveIndexChange(index)}
          aria-label={
            slide.type === "video"
              ? `Видео ${name}`
              : `${name} — фото ${index + 1}`
          }
          aria-pressed={activeIndex === index}
          className={`relative shrink-0 overflow-hidden rounded-lg border-2 transition-all ${thumbClassName} ${
            activeIndex === index
              ? "border-brand-olive opacity-70"
              : "border-transparent opacity-100"
          }`}
        >
          {slide.type === "video" ? (
            <GalleryVideo
              key={`thumb-${slide.src}`}
              src={slide.src}
              label={`Видео ${name}`}
              className="h-full w-full object-cover pointer-events-none"
              preload="metadata"
              playing={!isVideoActive}
            />
          ) : (
            <ProductImage
              src={slide.src}
              alt=""
              fill
              className="object-cover"
              sizes={thumbImageSizes}
            />
          )}
        </button>
      ))}
    </div>
  );
}

function GalleryMainMedia({
  slide,
  name,
  objectFit,
  imageSizes,
  priority,
}: {
  slide: GallerySlide;
  name: string;
  objectFit: "cover" | "contain";
  imageSizes: string;
  priority?: boolean;
}) {
  if (slide.type === "video") {
    return (
      <GalleryVideo
        key={`main-${slide.src}`}
        src={slide.src}
        label={`Видео — ${name}`}
        className={`absolute inset-0 h-full w-full ${
          objectFit === "cover" ? "object-cover bg-brand-surface" : "object-contain bg-brand-surface"
        }`}
        playing
      />
    );
  }

  return (
    <ProductImage
      key={slide.src}
      src={slide.src}
      alt={name}
      fill
      className={objectFit === "cover" ? "object-cover" : "object-contain"}
      sizes={imageSizes}
      priority={priority}
    />
  );
}

const GALLERY_ARROW_CLASS =
  "absolute bottom-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-brand-terracotta/95 text-white shadow-[0_8px_24px_rgba(212,119,80,0.35)] backdrop-blur-[2px] transition-all duration-200 hover:border-white/50 hover:bg-brand-terracotta-logo hover:shadow-[0_10px_28px_rgba(201,106,74,0.42)] hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40";

function GalleryNavArrow({
  direction,
  onClick,
  disabled,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`${GALLERY_ARROW_CLASS} ${direction === "prev" ? "left-4" : "right-4"}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={direction === "prev" ? "M14 7l-5 5 5 5" : "M10 7l5 5-5 5"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
function ZoomInPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14.5 14.5L19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 7.5v5M7.5 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

type MobileImageZoomProps = {
  src: string;
  alt: string;
  onClose: () => void;
};

function getTouchDistance(
  touchA: { clientX: number; clientY: number },
  touchB: { clientX: number; clientY: number },
) {
  return Math.hypot(
    touchB.clientX - touchA.clientX,
    touchB.clientY - touchA.clientY,
  );
}

function MobileImageZoom({ src, alt, onClose }: MobileImageZoomProps) {
  const [scale, setScale] = useState(1.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);
  const panStart = useRef<{
    x: number;
    y: number;
    posX: number;
    posY: number;
  } | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2 && pinchStart.current) {
        event.preventDefault();
        const distance = getTouchDistance(event.touches[0], event.touches[1]);
        const nextScale = Math.min(
          4,
          Math.max(1, pinchStart.current.scale * (distance / pinchStart.current.distance)),
        );
        setScale(nextScale);
        return;
      }

      if (event.touches.length === 1 && panStart.current) {
        event.preventDefault();
        const touch = event.touches[0];
        setPosition({
          x: panStart.current.posX + (touch.clientX - panStart.current.x),
          y: panStart.current.posY + (touch.clientY - panStart.current.y),
        });
      }
    };

    viewport.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      viewport.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      pinchStart.current = {
        distance: getTouchDistance(event.touches[0], event.touches[1]),
        scale,
      };
      panStart.current = null;
      return;
    }

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      panStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        posX: position.x,
        posY: position.y,
      };
      pinchStart.current = null;
    }
  };

  const handleTouchEnd = () => {
    pinchStart.current = null;
    panStart.current = null;
  };

  return createPortal(
    <div className="fixed inset-0 z-[90] bg-white" role="dialog" aria-modal="true" aria-label="Увеличенное изображение">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-brand-olive/20 bg-white text-brand-olive-dark shadow-lg"
        aria-label="Закрыть"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div
        ref={viewportRef}
        className="flex h-full w-full items-center justify-center overflow-hidden px-4 pt-14 pb-6 touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative aspect-square w-full max-w-md will-change-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          <ProductImage
            src={src}
            alt={alt}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

type MobileGalleryProgressProps = {
  count: number;
  activeIndex: number;
};

function MobileGalleryProgress({ count, activeIndex }: MobileGalleryProgressProps) {
  return (
    <div className="mb-3 px-1">
      <div className="mb-2 flex items-center justify-center gap-2 text-[11px] tracking-wide text-brand-muted">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-brand-terracotta/50">
          <path d="M14 7l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Листайте влево или вправо</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-brand-terracotta/50">
          <path d="M10 7l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div
        className="flex items-center gap-2"
        role="tablist"
        aria-label="Слайды галереи"
      >
        {Array.from({ length: count }, (_, index) => (
          <div
            key={`mobile-progress-${index}`}
            role="tab"
            aria-selected={activeIndex === index}
            className={`h-1 flex-1 rounded-full transition-colors ${
              activeIndex === index
                ? "bg-brand-terracotta"
                : "border border-dashed border-brand-olive/35 bg-brand-surface"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

type MobileProductGalleryProps = {
  slides: GallerySlide[];
  name: string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
};

function MobileProductGallery({
  slides,
  name,
  activeIndex,
  onActiveIndexChange,
}: MobileProductGalleryProps) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const didSwipe = useRef(false);
  const activeSlide = slides[activeIndex] ?? slides[0];
  const isVideoSlide = activeSlide?.type === "video";

  useEffect(() => {
    setZoomOpen(false);
  }, [activeIndex]);

  if (!activeSlide) return null;

  const goToSlide = (index: number) => {
    onActiveIndexChange((index + slides.length) % slides.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;

    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart.current || slides.length <= 1) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;

    touchStart.current = null;

    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    didSwipe.current = true;

    if (deltaX < 0) {
      goToSlide(activeIndex + 1);
      return;
    }

    goToSlide(activeIndex - 1);
  };

  return (
    <div className="md:hidden">
      {slides.length > 1 && (
        <MobileGalleryProgress count={slides.length} activeIndex={activeIndex} />
      )}

      <div
        className="relative mx-1 aspect-square overflow-hidden rounded-xl bg-brand-surface touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isVideoSlide ? (
          <GalleryMainMedia
            slide={activeSlide}
            name={name}
            objectFit="cover"
            imageSizes="(max-width: 768px) 92vw, 50vw"
            priority
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              if (didSwipe.current) {
                didSwipe.current = false;
                return;
              }
              setZoomOpen(true);
            }}
            className="relative block h-full w-full"
            aria-label="Увеличить изображение"
          >
            <GalleryMainMedia
              slide={activeSlide}
              name={name}
              objectFit="cover"
              imageSizes="(max-width: 768px) 92vw, 50vw"
              priority
            />
          </button>
        )}

        {!isVideoSlide && (
          <div
            className="pointer-events-none absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-olive-dark shadow-sm"
            aria-hidden
          >
            <ZoomInPlusIcon />
          </div>
        )}
      </div>

      {zoomOpen && activeSlide.type === "image" && (
        <MobileImageZoom
          src={activeSlide.src}
          alt={name}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </div>
  );
}

function GalleryLayout({
  slides,
  name,
  activeIndex,
  onActiveIndexChange,
  thumbClassName,
  mainClassName,
  mainObjectFit,
  mainImageSizes,
  thumbImageSizes,
  mainPriority,
  onMainClick,
  thumbListClassName = "max-h-full",
}: GalleryLayoutProps) {
  const activeSlide = slides[activeIndex] ?? slides[0];
  const isVideoActive = activeSlide?.type === "video";

  if (!activeSlide) return null;

  const mainPanel = (
    <GalleryMainMedia
      slide={activeSlide}
      name={name}
      objectFit={mainObjectFit}
      imageSizes={mainImageSizes}
      priority={mainPriority}
    />
  );

  return (
    <div className="flex gap-3 md:gap-4 items-start min-h-0">
      <GalleryThumbnails
        slides={slides}
        name={name}
        activeIndex={activeIndex}
        onActiveIndexChange={onActiveIndexChange}
        thumbClassName={thumbClassName}
        thumbImageSizes={thumbImageSizes}
        isVideoActive={isVideoActive}
        thumbListClassName={thumbListClassName}
      />

      {onMainClick ? (
        <button
          type="button"
          onClick={onMainClick}
          className={`min-w-0 flex-1 relative overflow-hidden rounded-xl bg-brand-surface shadow-sm cursor-zoom-in ${mainClassName}`}
          aria-label="Открыть галерею в полном размере"
        >
          {mainPanel}
        </button>
      ) : (
        <div
          className={`min-w-0 flex-1 relative overflow-hidden rounded-xl bg-brand-surface ${mainClassName}`}
        >
          {mainPanel}
        </div>
      )}
    </div>
  );
}

type ModalGalleryViewProps = {
  slides: GallerySlide[];
  name: string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onGoPrev: () => void;
  onGoNext: () => void;
};

function ModalGalleryView({
  slides,
  name,
  activeIndex,
  onActiveIndexChange,
  onGoPrev,
  onGoNext,
}: ModalGalleryViewProps) {
  const activeSlide = slides[activeIndex] ?? slides[0];
  const isVideoActive = activeSlide?.type === "video";
  const hasMultipleSlides = slides.length > 1;

  if (!activeSlide) return null;

  return (
    <div className="flex min-h-0 flex-1 gap-3 md:gap-4 overflow-hidden">
      <GalleryThumbnails
        slides={slides}
        name={name}
        activeIndex={activeIndex}
        onActiveIndexChange={onActiveIndexChange}
        thumbClassName="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24"
        thumbImageSizes="96px"
        isVideoActive={isVideoActive}
        thumbListClassName="max-h-full self-center"
      />

      <div className="relative min-h-0 min-w-0 flex-1">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="relative aspect-square h-full max-h-full max-w-full w-auto overflow-hidden rounded-xl bg-brand-surface">
            <GalleryMainMedia
              slide={activeSlide}
              name={name}
              objectFit="contain"
              imageSizes="(max-width: 1024px) 90vw, 60vw"
            />

            {hasMultipleSlides && (
              <>
                <GalleryNavArrow
                  direction="prev"
                  onClick={onGoPrev}
                  disabled={false}
                  label="Предыдущее фото"
                />
                <GalleryNavArrow
                  direction="next"
                  onClick={onGoNext}
                  disabled={false}
                  label="Следующее фото"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalThumbColumnSpacer({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div
      className="h-16 w-16 shrink-0 md:h-20 md:w-20 lg:h-24 lg:w-24"
      aria-hidden
    />
  );
}

type ProductGalleryModalFooterProps = {
  slides: GallerySlide[];
  slug: string;
  name: string;
  productImage: string;
  category: CategorySlug;
  stoneWeight: number;
  stoneLabel: string;
  inStock?: boolean;
};

function ProductGalleryModalFooter({
  slides,
  slug,
  name,
  productImage,
  category,
  inStock = true,
}: ProductGalleryModalFooterProps) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { selectedSize, selectedSizeLabel, artNo, productPrice, diamondWeight } =
    useProductSelection();
  const cartStoneLabel = formatInsertMassLabel(diamondWeight);

  const handleBuy = () => {
    if (!inStock) return;

    const variant = [
      cartStoneLabel,
      selectedSizeLabel != null ? `размер ${selectedSizeLabel}` : null,
    ]
      .filter(Boolean)
      .join(", ");

    addItem({
      productSlug: slug,
      name,
      image: productImage,
      price: productPrice,
      stoneWeight: diamondWeight,
      stoneLabel: cartStoneLabel,
      size: selectedSize,
      artNo,
    });
    trackAddToCart({
      id: artNo ?? slug,
      name,
      price: productPrice,
      category,
      variant: variant || undefined,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="flex shrink-0 gap-3 border-t border-brand-sand pt-4 md:gap-4">
      <ModalThumbColumnSpacer visible={slides.length > 1} />
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.15em] uppercase text-brand-muted mb-0.5">
            Цена изделия
          </p>
          <p className="font-heading text-2xl md:text-3xl text-brand-olive-dark">
            {formatPrice(productPrice)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            data-add-to-cart
            onClick={handleBuy}
            disabled={!inStock}
            className="px-6 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo disabled:cursor-not-allowed disabled:opacity-50 text-white text-sm tracking-widest uppercase transition-colors whitespace-nowrap"
          >
            {!inStock ? "Скоро будет" : added ? "Добавлено ✓" : "Купить"}
          </button>
          <FavoriteButton slug={slug} className={MODAL_ICON_BUTTON_CLASS} />
          <CompareButton slug={slug} className={MODAL_ICON_BUTTON_CLASS} />
        </div>
      </div>
    </div>
  );
}

type ProductGalleryModalProps = {
  open: boolean;
  onClose: () => void;
  slides: GallerySlide[];
  name: string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  slug: string;
  price: number;
  productImage: string;
  category: CategorySlug;
  stoneWeight: number;
  stoneLabel: string;
  inStock?: boolean;
};

function ProductGalleryModal({
  open,
  onClose,
  slides,
  name,
  activeIndex,
  onActiveIndexChange,
  slug,
  price,
  productImage,
  category,
  stoneWeight,
  stoneLabel,
  inStock = true,
}: ProductGalleryModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const goPrev = useCallback(() => {
    onActiveIndexChange((activeIndex - 1 + slides.length) % slides.length);
  }, [activeIndex, onActiveIndexChange, slides.length]);

  const goNext = useCallback(() => {
    onActiveIndexChange((activeIndex + 1) % slides.length);
  }, [activeIndex, onActiveIndexChange, slides.length]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (slides.length <= 1) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    },
    [goNext, goPrev, onClose, slides.length],
  );

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] max-md:hidden flex items-center justify-center p-4 md:p-8"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Закрыть галерею"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Галерея — ${name}`}
        className="relative z-10 flex h-[min(92vh,900px)] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-brand-surface shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-end border-b border-brand-sand px-4 py-3 md:px-6">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-muted transition-colors hover:bg-brand-sand hover:text-brand-terracotta-dark"
            aria-label="Закрыть"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-6">
          <ModalGalleryView
            slides={slides}
            name={name}
            activeIndex={activeIndex}
            onActiveIndexChange={onActiveIndexChange}
            onGoPrev={goPrev}
            onGoNext={goNext}
          />

          <ProductGalleryModalFooter
            slides={slides}
            slug={slug}
            name={name}
            productImage={productImage}
            category={category}
            stoneWeight={stoneWeight}
            stoneLabel={stoneLabel}
            inStock={inStock}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ProductGallery({
  images,
  name,
  videoUrl,
  slug,
  price,
  productImage,
  category,
  stoneWeight,
  stoneLabel,
  inStock = true,
}: ProductGalleryProps) {
  const slides = useMemo(() => {
    const uniqueImages = images.filter((img, i, arr) => arr.indexOf(img) === i);
    const items: GallerySlide[] = uniqueImages.map((src) => ({
      type: "image",
      src,
    }));

    if (videoUrl) {
      items.push({ type: "video", src: videoUrl });
    }

    return items;
  }, [images, videoUrl]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  if (slides.length === 0) return null;

  return (
    <>
      <MobileProductGallery
        slides={slides}
        name={name}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />

      <div className="hidden md:block">
        <GalleryLayout
          slides={slides}
          name={name}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          thumbClassName="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32"
          mainClassName="aspect-square"
          mainObjectFit="cover"
          mainImageSizes="(max-width: 1024px) 100vw, 50vw"
          thumbImageSizes="128px"
          mainPriority
          thumbListClassName="max-h-[min(80vw,36rem)]"
          onMainClick={() => setModalOpen(true)}
        />
      </div>

      <ProductGalleryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        slides={slides}
        name={name}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        slug={slug}
        price={price}
        productImage={productImage}
        category={category}
        stoneWeight={stoneWeight}
        stoneLabel={stoneLabel}
        inStock={inStock}
      />
    </>
  );
}
