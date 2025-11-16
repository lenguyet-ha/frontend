import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles(() => ({
  container: {
    width: "100%",
    height: "100%",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  priceContainer: {
    display: "flex",
    gap: "16px",
    "& > *": {
      flex: 1,
    },
  },
  sectionTitle: {
    marginTop: "16px",
    marginBottom: "8px",
    fontWeight: 600,
  },
  variantItem: {
    padding: "16px",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    borderRadius: "4px",
    marginBottom: "16px",
  },
  variantHeader: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  addVariantBtn: {
    marginTop: "8px",
  },
  skuContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  skuItem: {
    padding: "16px",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    borderRadius: "4px",
    backgroundColor: "#fafafa",
  },
  skuLabel: {
    fontWeight: 600,
    marginBottom: "8px",
  },
  skuInputs: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
}));
