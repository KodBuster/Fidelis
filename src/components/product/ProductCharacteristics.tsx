"use client";

import {
  extractInsertMassFromName,
  formatInsertMassLabel,
  INSERT_WEIGHT_LABEL,
} from "@/lib/synthetic-diamond-labels";
import { getProductCaratWeight } from "@/lib/product-weight";
import type { ProductDetails } from "@/lib/products";
import { useProductSelection } from "./ProductSelectionContext";

type ProductCharacteristicsProps = {
  product: ProductDetails;
};

export function ProductCharacteristics({ product }: ProductCharacteristicsProps) {
  const { selectedSize } = useProductSelection();
  const insertMass =
    extractInsertMassFromName(product.name) ??
    (product.stoneWeight > 0
      ? formatInsertMassLabel(getProductCaratWeight(product, selectedSize))
      : null);

  return (
    <div className="bg-brand-surface rounded-xl p-6 md:p-8">
      <h2 className="font-heading text-xl text-brand-olive-dark mb-4">
        Характеристики
      </h2>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-brand-sand pb-3">
          <dt className="text-brand-muted">Металл</dt>
          <dd className="text-brand-text text-right">{product.metal}</dd>
        </div>
        {product.cut?.trim() ? (
          <div className="flex justify-between gap-4 border-b border-brand-sand pb-3">
            <dt className="text-brand-muted">Огранка</dt>
            <dd className="text-brand-text text-right">{product.cut}</dd>
          </div>
        ) : null}
        {insertMass ? (
          <div className="flex justify-between gap-4">
            <dt className="text-brand-muted">{INSERT_WEIGHT_LABEL}</dt>
            <dd className="text-brand-text text-right">{insertMass}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
