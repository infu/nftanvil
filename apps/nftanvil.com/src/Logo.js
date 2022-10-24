import { Box, useColorModeValue, Stack, Text, Image } from "@chakra-ui/react";
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
            top: "-5px",
            left: "30px",
            color: theme === "dark" ? "gray.300" : "gray.800",
          }}
        >
          NFT<b>ANVIL</b>
        </Text>
        <Text
          mt="7px"
          fontSize="11.4px"
          ml="10px"
          sx={{
            position: "absolute",
            left: "30px",
            top: "12px",
            width: "85px",
            fontFamily: "Greycliff",
            color: theme === "dark" ? "gray.300" : "gray.800",
          }}
        >
          mint a promise
        </Text>
      </Stack>
    </Box>
  );
};
