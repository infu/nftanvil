import { Text, Stack, Box, useColorModeValue } from "@chakra-ui/react";
import { itemQuality, itemTransfer, itemUse } from "../item_config";
import { useEffect } from "react";
import { nftFetchMeta, nftMediaGet } from "../reducers/nft";
import { useSelector, useDispatch } from "react-redux";

import moment from "moment";
import styled from "@emotion/styled";
import thumb_bg from "../assets/default.png";
import thumb_over from "../assets/over.png";

const ContentBox = styled.div`
  position: relative;
  height: 400px;
  max-width: 500px;
  img {
    max-height: 100%;
    border-radius: 6px;
  }
  overflow: hidden;
`;

const Thumb = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 6px;
  position: relative;
  left: -4px;
  top: -4px;
  box-overflow: hidden;

  .border {
    top: 0px;
    left: 0px;
    position: absolute;
    background-image: url(${thumb_bg});
    width: 56px;
    height: 56px;

    &:hover {
      background-image: url(${thumb_over});
    }
  }
  .custom {
    top: 0px;
    left: 0px;
    position: absolute;
    margin: 4px 4px;
    object-fit: cover;
    object-position: center center;
    height: 48px;
    width: 48px;
    border-radius: 5px;
  }
`;

const encodeChunkId = (tokenIndex, chunkIndex, ctype) => {
  return (tokenIndex << 19) | ((chunkIndex & 255) << 2) | ctype;
};
export const NFT = ({ id }) => {
  const meta = useSelector((state) => state.nft.meta[id]);
  const dispatch = useDispatch();
  console.log("meta", meta);
  if (meta?.tokenIndex)
    console.log("UUURL", encodeChunkId(meta.tokenIndex, 0, 0).toString(16));

  useEffect(() => {
    dispatch(nftFetchMeta(id));
  }, [id]);

  return <NFTThumb {...meta} />;
};

export const NFTContent = (p) => {
  return (
    <ContentBox>
      {p.content?.internal?.url ? <img src={p.content.internal.url} /> : ""}
    </ContentBox>
  );
};

export const NFTPreview = (p) => {
  return (
    <Stack spacing="5" ml={"20px"} mt={"80px"}>
      <NFTContent {...p} />
      <NFTInfo {...p} />
      <NFTThumb {...p} />
    </Stack>
  );
};

export const NFTThumb = (p) => {
  return (
    <Thumb>
      {p.thumb?.internal?.url ? (
        <img className="custom" src={p.thumb.internal.url} />
      ) : (
        ""
      )}
      <div className="border" />
    </Thumb>
  );
};

export const NFTInfo = (p) => {
  const bg = useColorModeValue("white", "gray.700");
  const qcolor = itemQuality[p.quality].color;

  return (
    <Box
      bg={bg}
      borderRadius="md"
      borderWidth={"2px"}
      ml={"28px"}
      mt={"480px"}
      w={350}
      p={2}
    >
      {p.content?.thumb?.url ? <img src={p.content.thumb.url} /> : ""}

      <Stack spacing={0}>
        {p.name ? (
          <Text color={qcolor} fontSize="16px">
            {p.name.capitalize()}
          </Text>
        ) : null}
        {"bindsForever" in p.transfer ? (
          <Text fontSize="14px">Binds on transfer</Text>
        ) : null}
        {"bindsDuration" in p.transfer ? (
          <Text fontSize="14px">
            Binds on transfer for{" "}
            {moment.duration(p.transfer.bindsDuration, "minutes").humanize()}
          </Text>
        ) : null}
        {p.use && p.use.consumable && p.use.consumable.desc ? (
          <Text fontSize="14px" color={"green"} as="i">
            Use: {p.use.consumable.desc.capitalize()} (Consumed in the process)
          </Text>
        ) : null}

        {p.use && p.use.cooldown && p.use.cooldown.desc ? (
          <Text fontSize="14px" color={"green.300"}>
            Use: {p.use.cooldown.desc.capitalize()} (
            {moment.duration(p.use.cooldown.duration, "minutes").humanize()}{" "}
            cooldown)
          </Text>
        ) : null}
        {p.hold?.external?.desc ? (
          <Text fontSize="14px" color={"green.300"}>
            Hold: {p.hold.external.desc.capitalize()}
          </Text>
        ) : null}
        {p.attributes && p.attributes.length
          ? p.attributes.map((a, idx) => (
              <Text key={idx} fontSize="14px">
                {a[1] >= 0 ? "+" : ""}
                {a[1]} {a[0].capitalize()}
              </Text>
            ))
          : null}
        {p.lore ? (
          <Text fontSize="14px" pt="14px" color={"yellow"}>
            "{p.lore.capitalize()}"
          </Text>
        ) : null}
        {p.ttl && p.ttl > 0 ? (
          <Text fontSize="14px" pt="14px" color={"red"}>
            Lasts {moment.duration(p.ttl, "minutes").humanize()}
          </Text>
        ) : null}
      </Stack>
    </Box>
  );
};
