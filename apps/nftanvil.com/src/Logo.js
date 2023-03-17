import {
  Box,
  useColorModeValue,
  Stack,
  Text,
  Image,
} from "@vvv-interactive/nftanvil-react/src/chakra.js";
import anvillogo from "./assets/anvillogo.svg";

export const Logo = () => {
  const theme = useColorModeValue("light", "dark");

  return (
    <Box w={120}>
      <Stack direction="horizontal" ml="6px" sx={{ position: "relative" }}>
        <Image src={anvillogo} width="30px" />
        <Text
          mt="7px"
          ml="10px"
          sx={{
            fontFamily: "Greycliff",
            position: "absolute",
            top: "0px",
            left: "30px",
            color: theme === "dark" ? "gray.300" : "gray.800",
          }}
        >
          <b>ANVIL</b>
        </Text>
      </Stack>
    </Box>
  );
};
