import React from "react";
import { Typography, Box, CircularProgress } from "@mui/material";
import { Receipt } from "@mui/icons-material";
import { OrderDetailCard, SectionTitle } from "../OrderDetail.styles";
import * as ReviewsApi from "@/api/reviews";

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

interface OrderReviewsCardProps {
  orderStatus: string;
  orderItems: OrderItem[];
  orderReviews: ReviewsApi.Review[] | null;
  loadingReviews: boolean;
}

const OrderReviewsCard: React.FC<OrderReviewsCardProps> = ({
  orderStatus,
  orderItems,
  orderReviews,
  loadingReviews,
}) => {
  if (orderStatus !== "DELIVERED") {
    return null;
  }

  return (
    <OrderDetailCard>
      <SectionTitle>
        <Receipt sx={{ mr: 1, verticalAlign: "middle" }} />
        Đánh giá của bạn
      </SectionTitle>

      {loadingReviews ? (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={30} />
        </Box>
      ) : orderReviews && orderReviews.length > 0 ? (
        <Box>
          {orderReviews.map((review) => {
            const product = orderItems.find(item => item.productId === review.productId);
            return (
              <Box key={review.id} sx={{ mb: 3, pb: 3, borderBottom: '1px solid #e0e0e0', '&:last-child': { borderBottom: 'none' } }}>
                {/* Product Info */}
                {product && (
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <img
                      src={product.image}
                      alt={product.productName}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                    />
                    <Typography variant="subtitle1" fontWeight="medium">
                      {product.productTranslations.length > 0
                        ? product.productTranslations[0].name
                        : product.productName}
                    </Typography>
                  </Box>
                )}

                {/* Rating */}
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  {[...Array(5)].map((_, index) => (
                    <Box
                      key={index}
                      component="span"
                      sx={{
                        color: index < review.rating ? '#FFB400' : '#E0E0E0',
                        fontSize: 20,
                      }}
                    >
                      ★
                    </Box>
                  ))}
                  <Typography variant="caption" color="text.secondary" ml={1}>
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>

                {/* Content */}
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {review.content}
                </Typography>

                {/* Images */}
                {review.medias.length > 0 && (
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {review.medias.map((media) => (
                      <img
                        key={media.id}
                        src={media.url}
                        alt="Review"
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 8,
                          cursor: 'pointer',
                        }}
                        onClick={() => window.open(media.url, '_blank')}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
          Bạn chưa đánh giá đơn hàng này
        </Typography>
      )}
    </OrderDetailCard>
  );
};

export default OrderReviewsCard;
