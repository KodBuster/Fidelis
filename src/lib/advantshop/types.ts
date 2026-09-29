export type AdvantShopPhoto = {
  smallSrc?: string | null;
  middleSrc?: string | null;
  bigSrc?: string | null;
  main?: boolean;
};

export type AdvantShopCatalogProduct = {
  productId: number;
  offerId?: number;
  urlPath: string;
  name: string;
  briefDescription?: string;
  artNo?: string;
  price: number;
  priceWithDiscount?: number;
  /** Остаток на складе (если API отдаёт на уровне товара). */
  amount?: number;
  newProduct?: boolean;
  bestseller?: boolean;
  sales?: boolean;
  recomended?: boolean;
  photoMiddle?: string | null;
  photoSmall?: string | null;
  photos?: AdvantShopPhoto[] | null;
  sizeId?: number | null;
  sizeColorPicker?: {
    sizes?: { id: number; name: string }[];
  };
  offers?: AdvantShopOffer[] | null;
};

export type AdvantShopCatalogResponse = {
  products?: AdvantShopCatalogProduct[];
  pager?: {
    currentPage: number;
    totalPageCount: number;
    totalCount: number;
  };
  category?: {
    id: number;
    url: string;
    name: string;
  };
};

export type AdvantShopSearchResponse = {
  products?: AdvantShopCatalogProduct[];
  categories?: AdvantShopCategory[];
  pager?: {
    currentPage: number;
    totalPageCount: number;
    totalCount: number;
  };
};

export type AdvantShopSearchAutocompleteResponse = {
  products?: AdvantShopCatalogProduct[];
  categories?: AdvantShopCategory[];
};

export type AdvantShopCategory = {
  id: number;
  name: string;
  url: string;
  parentCategoryId?: number;
};

export type AdvantShopCategoriesResponse = {
  categories?: AdvantShopCategory[];
  pagination?: {
    currentPage: number;
    totalPageCount: number;
  };
};

export type AdvantShopPropertyValue = {
  value?: string;
  propertyValue?: string;
  Value?: string;
  offerId?: number | null;
  OfferId?: number | null;
  artNo?: string | null;
  offerArtNo?: string | null;
};

export type AdvantShopProperty = {
  name?: string;
  Name?: string;
  value?: string;
  propertyName?: string;
  propertyValue?: string;
  offerId?: number | null;
  artNo?: string | null;
  offerArtNo?: string | null;
  values?: AdvantShopPropertyValue[];
  propertyValues?: AdvantShopPropertyValue[];
  selectedPropertyValues?: AdvantShopPropertyValue[];
  SelectedPropertyValues?: AdvantShopPropertyValue[];
};

export type AdvantShopOffer = {
  offerId: number;
  artNo?: string;
  price: number;
  oldPrice?: number;
  amount?: number;
  isMain?: boolean;
  sizeId?: number | null;
  /** Вес модификации (г), разный у размеров. */
  weight?: number | null;
  /** Длина модификации (мм), для браслетов. */
  length?: number | null;
  properties?: AdvantShopProperty[] | null;
  params?: AdvantShopProperty[] | null;
};

export type AdvantShopProductDetails = {
  productId: number;
  artNo?: string;
  name: string;
  urlPath: string;
  briefDescription?: string;
  description?: string;
  amount?: number;
  newProduct?: boolean;
  bestseller?: boolean;
  sales?: boolean;
  photos?: AdvantShopPhoto[] | null;
  offers?: AdvantShopOffer[];
  sizeColorPicker?: {
    sizes?: { id: number; name: string }[];
  };
  brand?: {
    name?: string | null;
    urlPath?: string | null;
  } | null;
};

export type AdvantShopPropertyGroup = {
  groupName?: string;
  properties?: AdvantShopProperty[];
  Properties?: AdvantShopProperty[];
};

/** Client API / admin may return a flat list, `{ properties }`, or `{ Groups }`. */
export type AdvantShopPropertiesResponse =
  | { properties?: AdvantShopProperty[]; Groups?: AdvantShopPropertyGroup[] }
  | AdvantShopPropertyGroup[]
  | AdvantShopProperty[];
