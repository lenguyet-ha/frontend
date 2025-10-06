import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles(() => ({
  card: {
    maxWidth: 300,
    height: "100%",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: 4,
    },
  },
  media: {
    height: 200,
  },
  content: {},
  title: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  description: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    marginBottom: 2,
  },
  priceContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    marginBottom: 1,
  },
  price: {
    fontWeight: "bold",
  },
  originalPrice: {
    textDecoration: "line-through",
  },
  button: {
    marginTop: 1,
  },
}));
