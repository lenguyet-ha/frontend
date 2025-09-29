import { HelmetProvider } from "react-helmet-async";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";

const LoginScreen = dynamic(
  () => import("../../src/screens/LoginScreen").then((mod) => mod.LoginScreen),
  { ssr: false }
);

export default function Login() {
  return (
    <Box>
      <HelmetProvider>
        <LoginScreen />
      </HelmetProvider>
    </Box>
  );
}
