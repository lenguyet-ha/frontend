import React from "react";
import { Typography, Divider } from "@mui/material";
import { Receipt } from "@mui/icons-material";
import {
  OrderDetailCard,
  SectionTitle,
  ProductItem,
  ProductImage,
  ProductInfo,
  PriceInfo,
  TotalSection,
  TotalRow,
  TotalLabel,
  TotalValue,
} from "../OrderDetail.styles";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productTranslations: Array<{
    id: number;
    name: string;
    description: string;
    languageId: string;
  }>;
  skuPrice: number;
  image: string;
  skuValue: string;
  skuId: number;
  orderId: number;
  quantity: number;
  createdAt: string;
}

interface OrderProductsCardProps {
  items: OrderItem[];
  formatPrice: (price: number) => string;
  calculateTotal: (items: OrderItem[]) => number;
  onProductClick: (productId: number) => void;
}

const OrderProductsCard: React.FC<OrderProductsCardProps> = ({
  items,
  formatPrice,
  calculateTotal,
  onProductClick,
}) => {
  const totalAmount = calculateTotal(items);

  return (
    <OrderDetailCard>
      <SectionTitle>
        <Receipt sx={{ mr: 1, verticalAlign: "middle" }} />
        Sản phẩm ({items.length})
      </SectionTitle>

      {items.map((item) => (
        <ProductItem key={item.id}>
          <ProductImage
            src={item.image}
            alt={item.productName}
            onClick={() => onProductClick(item.productId)}
            style={{ cursor: "pointer" }}
          />
          <ProductInfo>
            <Typography
              variant="subtitle1"
              fontWeight="medium"
              sx={{
                cursor: "pointer",
                "&:hover": { color: "primary.main" },
              }}
              onClick={() => onProductClick(item.productId)}
            >
              {item.productTranslations.length > 0
                ? item.productTranslations[0].name
                : item.productName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phân loại: {item.skuValue}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Số lượng: x{item.quantity}
            </Typography>
          </ProductInfo>
          <PriceInfo>
            <Typography
              variant="body1"
              color="primary.main"
              fontWeight="medium"
            >
              {formatPrice(item.skuPrice)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng: {formatPrice(item.skuPrice * item.quantity)}
            </Typography>
          </PriceInfo>
        </ProductItem>
      ))}

      {/* Total */}
      <TotalSection>
        <TotalRow>
          <TotalLabel>Tổng số lượng:</TotalLabel>
          <Typography variant="body1" fontWeight="medium">
            {items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
          </Typography>
        </TotalRow>
      
      </TotalSection>
    </OrderDetailCard>
  );
};

export default OrderProductsCard;
