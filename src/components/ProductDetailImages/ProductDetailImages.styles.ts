import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles(() => ({
  mainImage: {
    width: "100%",
    height: 500,
    objectFit: "cover",
    borderRadius: 2,
    marginBottom: 2,
  },
  thumbnailContainer: {
    display: "flex",
    gap: 1,
    overflowX: "auto",
  },
  thumbnail: {
    width: 80,
    height: 80,
    objectFit: "cover",
    borderRadius: 1,
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      borderColor: "#1976d2",
    },
  },
  thumbnailSelected: {
    border: 3,
    borderColor: "#1976d2",
  },
  thumbnailUnselected: {
    border: 1,
    borderColor: "#e0e0e0",
  },
}));
