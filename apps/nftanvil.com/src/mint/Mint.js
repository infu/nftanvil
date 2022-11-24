import { Box, Button, Center, HStack, Wrap } from "@chakra-ui/react";
import { Routes, Route, Link, Outlet, NavLink } from "react-router-dom";

export const Mint = () => {
  return (
    <>
      <Center mt="-43px">
        <Box>
          <HStack spacing="1px">
            <NavLink to="nft">
              {({ isActive }) => (
                <Button
                  _active={{
                    bg: "#7d2141",
                  }}
                  isActive={isActive}
                  borderRadius="5px 0px 0px 5px"
                >
                  Nft
                </Button>
              )}
            </NavLink>
            <NavLink to="ft">
              {({ isActive }) => (
                <Button
                  isActive={isActive}
                  _active={{
                    bg: "#7d2141",
                  }}
                  borderRadius="0px 0px 0px 0px"
                >
                  Fungible
                </Button>
              )}
            </NavLink>
            <NavLink to="pool">
              {({ isActive }) => (
                <Button
                  _active={{
                    bg: "#7d2141",
                  }}
                  isActive={isActive}
                  borderRadius="0px 5px 5px 0px"
                >
                  Pool
                </Button>
              )}
            </NavLink>
          </HStack>
        </Box>
      </Center>

      <Outlet />
    </>
  );
};
