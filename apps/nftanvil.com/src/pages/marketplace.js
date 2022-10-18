import {
  MarketplaceLoad,
  MarketplaceFilters,
  useAnvilDispatch,
  useAnvilSelector,
  tokenSelector,
  InventoryLarge,
} from "../nftanvil-react/";
import { Stack, Button, Center, Box } from "@chakra-ui/react";
import {
  encodeTokenId,
  decodeTokenId,
  tokenUrl,
  ipfsTokenUrl,
  tokenToText,
  tokenFromText,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
export function PageMarketplace() {
  // const { width, height } = useWindowSize();

  return (
    <>
      <MarketplaceLoad
        author={
          "bbd87200973033cb69bc0aee03e90df1a1de01e28aa0246bb175baabfd071754" //"a004f41ea1a46f5b7e9e9639fbed84e037d9ce66b75d392d2c1640bb7a559cda" //, // "" // ""
        }
      >
        {(items) => (
          <MarketplaceFilters
            items={items}
            attributes={[
              ["attack", "with attack"],
              ["airdrops", "width airdrops"],
            ]}
            tags={[
              ["Ship 13", "Space 23"],
              ["Thistle Fusion", "Terraform Haze"],
            ]}
          >
            {({
              goPageBack,
              goPageNext,
              stats,
              fOrder,
              fQuality,
              fTags,
              slice,
            }) => {
              return (
                <Box>
                  <Stack m="auto" maxW={"600px"}>
                    <Box>
                      {goPageBack}
                      {goPageNext}
                    </Box>
                    {fOrder}
                    {fTags}
                    {stats ? <div>Floor: {stats.floor}</div> : null}
                    {stats ? <div>Mean: {stats.mean}</div> : null}
                  </Stack>
                  <InventoryLarge
                    items={slice.map((x) => tokenToText(x[0]))}
                    custom={(meta) => {
                      return (
                        <div style={{ paddingTop: "30px" }}>{meta.tags[0]}</div>
                      );
                    }}
                    onOpenNft={(id) => {}}
                  />
                </Box>
              );
            }}
          </MarketplaceFilters>
        )}
      </MarketplaceLoad>
    </>
  );
}
