import { Box, Wrap, useColorModeValue, Center, Stack } from "@chakra-ui/react";

import { NFTLarge, NFT } from "./NFT";

export const InventoryLarge = ({ items, onOpenNft, custom }) => {
  let bg = useColorModeValue(itemgrid_light, itemgrid);

  if (!items) return null;

  // console.log({ items, meta, address, pageIdx, maxItems });

  return (
    <Stack mt="8">
      <Center>
        <Box mt="4" mb="4" w={"100%"} bg={bg}>
          <Wrap direction={"horizontal"} spacing="5" justify="center">
            {items &&
              items.map((id) => (
                <NFTLarge
                  custom={custom}
                  id={id}
                  key={id}
                  onClick={() => onOpenNft(id)}
                />
              ))}
          </Wrap>
        </Box>
      </Center>

      {/* {meta ? (
          <NftHistory transactions={meta.transactions} showThumb={true} />
        ) : null} */}
    </Stack>
  );
};
