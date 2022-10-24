import { Box, Button, Center, HStack, Wrap } from "@chakra-ui/react";
import { Routes, Route, Link, Outlet } from "react-router-dom";

export const Mint = () => {
  return (
    <>
      <Center>
        <Box>
          <HStack>
            <Link to="nft">
              <Button>Nft</Button>
            </Link>
            <Link to="ft">
              <Button>Fungible</Button>
            </Link>
          </HStack>
        </Box>
      </Center>

      <Outlet />
    </>
  );
};
