import { HelmetProvider } from "react-helmet-async";
import { Box } from "@mui/material";
import { ProductList } from "@/screens/Products/ProductList";

export default function Products() {
  return (
    <Box>
      <HelmetProvider>
        <ProductList />
      </HelmetProvider>
    </Box>
  );
}

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};
