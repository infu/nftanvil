import { Box, Button, Center, HStack, Wrap } from "@chakra-ui/react";
import { Routes, Route, Link, Outlet } from "react-router-dom";

export const MarketplacePage = () => {
  return (
    <>
      <Center>
        <Box mb="3">
          <HStack>
            <Link to="a00aa2d5f5f9738e300615f21104cd06bbeb86bb8daee215525ac2ffde621bed">
              <Button>Cosmicrafts</Button>
            </Link>
            <Link to="a00e800cc13897a27cd04fa4286bfb72ea01025956f991078f374227b8ed8a91">
              <Button>Cosmicrafts Beta</Button>
            </Link>
          </HStack>
        </Box>
      </Center>
      <Outlet />
    </>
  );
};
