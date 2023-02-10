import React, { useEffect, useState } from "react";

import { Box, Wrap, useColorModeValue, Center, Stack } from "@chakra-ui/react";

import { NFTLarge, NFT } from "./NFT";

export const InventoryLarge = ({ items, onOpenNft, custom, width, height }) => {
  if (!items) return null;

  return (
    <Stack mt="8">
      <Center>
        <Box mt="4" mb="4" w={"100%"}>
          <Wrap direction={"horizontal"} spacing="5" justify="center">
            {items &&
              items.map((id) => (
                <NFTLarge
                  custom={custom}
                  id={id}
                  key={id}
                  width={width}
                  height={height}
                  onClick={() => onOpenNft(id)}
                />
              ))}
          </Wrap>
        </Box>
      </Center>
    </Stack>
  );
};
