import { Box, Button, Center, HStack, Wrap } from "@chakra-ui/react";
import { Routes, Route, Link, Outlet } from "react-router-dom";

export const InventoryPage = () => {
  return (
    <>
      <Center>
        <Box mb="3">
          <HStack>
            <Link to="single">
              <Button>Single</Button>
            </Link>
            <Link to="double">
              <Button>Double</Button>
            </Link>
          </HStack>
        </Box>
      </Center>
      <Outlet />
    </>
  );
};
