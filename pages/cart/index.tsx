import { HelmetProvider } from "react-helmet-async";
import { Box } from "@mui/material";
import Cart from "@/screens/Cart/Cart";


export default function CartPage() {
  return (
    <Box>
      <HelmetProvider>
        <Cart />
      </HelmetProvider>
    </Box>
  );
}

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};
