import { HelmetProvider } from "react-helmet-async";
import { LoginScreen } from "../../src/screens/LoginScreen";
import { Box } from "@mui/material";

export default function Login() {
  return (
    <Box>
      <HelmetProvider>
        <LoginScreen />
      </HelmetProvider>
    </Box>
  );
}
