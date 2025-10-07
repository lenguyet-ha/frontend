import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles(() => ({
  cartContainer: {
    padding: 16,
  },
  shopCard: {
    marginBottom: 24,
    padding: 16,
  },
  shopTitle: {
    marginBottom: 16,
    color: "#1976d2",
  },
  cartItem: {
    marginBottom: 16,
  },
  itemImage: {
    height: 100,
    objectFit: "cover",
    borderRadius: 4,
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  quantityText: {
    minWidth: 40,
    textAlign: "center",
  },
  totalSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  checkoutButton: {
    backgroundColor: "#1976d2",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#1565c0",
    },
  },
  emptyCart: {
    padding: 32,
    textAlign: "center",
  },
  mainContainer: {
    padding: 16,
  },
  shopPaper: {
    marginBottom: 24,
    padding: 16,
  },
  shopHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 16,
  },
  shopAvatar: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  shopName: {
    color: "primary.main",
  },
  itemCard: {
    marginBottom: 16,
  },
  itemMedia: {
    height: 100,
    width: 100,
    borderRadius: 4,
  },
  quantityBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));
