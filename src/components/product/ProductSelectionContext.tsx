"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  getProductSizeLabel,
  getProductSizePrice,
  type ProductDetails,
} from "@/lib/products";
import {
  getProductCaratWeight,
  getProductCaratWeightLabel,
} from "@/lib/product-weight";

type ProductSelectionContextValue = {
  selectedSize: string | null;
  setSelectedSize: (size: string | null) => void;
  selectedSizeLabel: string | null;
  sizeHref: (size: string) => string;
  artNo?: string;
  price: number;
  diamondWeight: number;
  diamondWeightLabel: string;
};

const ProductSelectionContext = createContext<ProductSelectionContextValue | null>(
  null,
);

function resolveArtNo(
  product: ProductDetails,
  selectedSize: string | null,
): string | undefined {
  if (selectedSize && product.sizeArtNos?.[selectedSize]) {
    return product.sizeArtNos[selectedSize];
  }
  return product.artNo;
}

function pickDefaultSelectedSize(product: ProductDetails): string | null {
  if (!product.sizeOptions.length) return null;
  const inStock = product.sizeOptions.find((option) => {
    const amount = product.sizeStockAmounts?.[option.value];
    return amount === undefined || amount > 0;
  });
  return (inStock ?? product.sizeOptions[0]).value;
}

function isValidSize(product: ProductDetails, size: string | null): boolean {
  if (!size) return false;
  return product.sizeOptions.some((option) => option.value === size);
}

export function ProductSelectionProvider({
  product,
  children,
}: {
  product: ProductDetails;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sizeParam = searchParams.get("size");

  const [selectedSize, setSelectedSizeState] = useState<string | null>(() => {
    if (isValidSize(product, sizeParam)) return sizeParam;
    return pickDefaultSelectedSize(product);
  });

  useEffect(() => {
    if (isValidSize(product, sizeParam) && sizeParam !== selectedSize) {
      setSelectedSizeState(sizeParam);
    }
    // Intentionally only sync when URL size changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeParam, product]);

  const sizeHref = useCallback(
    (size: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("size", size);
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams],
  );

  const setSelectedSize = useCallback(
    (size: string | null) => {
      setSelectedSizeState(size);
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      if (size) params.set("size", size);
      else params.delete("size");
      const query = params.toString();
      const next = query ? `${pathname}?${query}` : pathname;
      window.history.replaceState(null, "", next);
    },
    [pathname],
  );

  const value = useMemo(
    () => ({
      selectedSize,
      setSelectedSize,
      selectedSizeLabel: getProductSizeLabel(product, selectedSize) ?? null,
      sizeHref,
      artNo: resolveArtNo(product, selectedSize),
      price: getProductSizePrice(product, selectedSize),
      diamondWeight: getProductCaratWeight(product, selectedSize),
      diamondWeightLabel: getProductCaratWeightLabel(product, selectedSize),
    }),
    [product, selectedSize, setSelectedSize, sizeHref],
  );

  return (
    <ProductSelectionContext.Provider value={value}>
      {children}
    </ProductSelectionContext.Provider>
  );
}

export function useProductSelection() {
  const context = useContext(ProductSelectionContext);
  if (!context) {
    throw new Error(
      "useProductSelection must be used within ProductSelectionProvider",
    );
  }
  return context;
}
