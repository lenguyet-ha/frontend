export interface ProductVariant {
  value: string;
  options: string[];
}

export interface ProductSKU {
  value: string;
  price: number;
  stock: number;
  image: string;
}

export interface ProductCategory {
  id: number;
  name: string;
}

export interface ProductCreate {
  publishedAt: string | null;
  name: string;
  basePrice: number;
  virtualPrice: number;
  brandId: number;
  images: string[];
  variants: ProductVariant[];
  categories: number[];
  skus: ProductSKU[];
}

export interface ProductUpdate extends ProductCreate {
  productId: number;
}

export interface Product extends Omit<ProductCreate, "categories"> {
  id: number;
  shopId: number;
  categories: ProductCategory[];
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = "ACTIVE" | "INACTIVE" | "WAITING_ACTIVE";
