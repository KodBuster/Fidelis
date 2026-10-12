"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  isMissingProductPhoto,
  resolveProductImageUrl,
} from "@/lib/advantshop/images";

type ProductImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
};

function PhotoComingSoonBanner({
  fill,
  className,
}: {
  fill?: boolean;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label="фото скоро появится"
      className={[
        fill ? "absolute inset-0" : "relative aspect-square w-full",
        "flex items-center justify-center bg-[#E6E2DC] px-4 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="font-heading text-sm md:text-base tracking-[0.04em] text-[#8A8178]">
        фото скоро появится
      </span>
    </div>
  );
}

export function ProductImage({
  src,
  alt,
  fallbackSrc = PRODUCT_IMAGE_PLACEHOLDER,
  className,
  fill,
  ...props
}: ProductImageProps) {
  const resolvedSrc = resolveProductImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);
  const [failed, setFailed] = useState(false);
  const isProxied = currentSrc.startsWith("/api/advantshop-image");

  useEffect(() => {
    setCurrentSrc(resolveProductImageUrl(src));
    setFailed(false);
  }, [src]);

  if (failed || isMissingProductPhoto(currentSrc)) {
    return <PhotoComingSoonBanner fill={fill} className={className} />;
  }

  return (
    <Image
      {...props}
      fill={fill}
      className={className}
      key={currentSrc}
      src={currentSrc}
      alt={alt}
      unoptimized={isProxied || currentSrc.endsWith(".svg")}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
