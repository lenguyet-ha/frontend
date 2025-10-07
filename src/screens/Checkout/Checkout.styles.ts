import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles(() => ({
  checkoutContainer: {
    padding: 16,
    maxWidth: 1200,
    margin: "0 auto",
  },
  section: {
    marginBottom: 24,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: "#1976d2",
    fontWeight: "bold",
  },
  receiverForm: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  orderSummary: {
    backgroundColor: "#f5f5f5",
  },
  orderItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    objectFit: "cover",
  },
  itemInfo: {
    flex: 1,
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "bold",
    fontSize: "1.2rem",
    borderTop: "2px solid #ddd",
    paddingTop: 8,
  },
  paymentMethods: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  shippingMethods: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  checkoutButton: {
    backgroundColor: "#1976d2",
    color: "#fff",
    padding: "12px 24px",
    fontSize: "1.1rem",
    "&:hover": {
      backgroundColor: "#1565c0",
    },
  },
  discountSection: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  qrDialog: {
    textAlign: "center",
  },
  qrCode: {
    border: "2px solid #ddd",
    borderRadius: 8,
    margin: "16px auto",
  },
}));
