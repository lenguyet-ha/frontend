import React from "react";
import { Person, Phone, LocationOn } from "@mui/icons-material";
import {
  OrderDetailCard,
  SectionTitle,
  InfoRow,
  InfoLabel,
  InfoValue,
} from "../OrderDetail.styles";

interface Receiver {
  name: string;
  phone: string;
  address: string;
}

interface OrderReceiverCardProps {
  receiver: Receiver;
}

const OrderReceiverCard: React.FC<OrderReceiverCardProps> = ({ receiver }) => {
  return (
    <OrderDetailCard>
      <SectionTitle>
        <Person sx={{ mr: 1, verticalAlign: "middle" }} />
        Thông tin người nhận
      </SectionTitle>

      <InfoRow>
        <InfoLabel>
          <Person sx={{ mr: 1, verticalAlign: "middle" }} />
          Tên người nhận
        </InfoLabel>
        <InfoValue>{receiver.name}</InfoValue>
      </InfoRow>

      <InfoRow>
        <InfoLabel>
          <Phone sx={{ mr: 1, verticalAlign: "middle" }} />
          Số điện thoại
        </InfoLabel>
        <InfoValue>{receiver.phone}</InfoValue>
      </InfoRow>

      <InfoRow>
        <InfoLabel>
          <LocationOn sx={{ mr: 1, verticalAlign: "middle" }} />
          Địa chỉ
        </InfoLabel>
        <InfoValue>{receiver.address}</InfoValue>
      </InfoRow>
    </OrderDetailCard>
  );
};

export default OrderReceiverCard;
