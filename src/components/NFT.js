import { Text, Stack, Box, useColorModeValue } from "@chakra-ui/react";
import { itemQuality, itemTransfer, itemUse } from "../item_config";
import { useEffect } from "react";
import { nftFetchMeta, nftMediaGet } from "../reducers/nft";
import { useSelector, useDispatch } from "react-redux";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";
import moment from "moment";
import styled from "@emotion/styled";
import thumb_bg from "../assets/default.png";
import thumb_over from "../assets/over.png";

const ContentBox = styled.div`
  // position: relative;
  // height: 300px;
  margin: 12px 0px;
  // max-width: 500px;
  // max-height: 500px;
  img {
    max-width: 600px;
    max-height: 500px;
    // max-height: 100%;
    border-radius: 6px;
  }
  // overflow: hidden;
`;

const Thumb = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 6px;
  position: relative;
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

export const NFT = ({ id }) => {
  const meta = useSelector((state) => state.nft.meta[id]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(nftFetchMeta(id));
  }, [id]);

  return (
    <Popover
      placement="top-start"
      trigger="hover"
      isLazy={true}
      matchWidth={true}
    >
      <PopoverTrigger>
        <Thumb>
          {meta?.thumb?.internal?.url ? (
            <img className="custom" src={meta.thumb.internal.url} />
          ) : (
            ""
          )}
          <div className="border" />
        </Thumb>
        {/* <NFTThumb meta={meta} /> */}
      </PopoverTrigger>
      <PopoverContent
        w={"600px"}
        bg={"transparent"}
        border={"0"}
        //    sx={{ outline: "none" }}
      >
        <NFTContent meta={meta} />
        <NFTInfo meta={meta} />
      </PopoverContent>
    </Popover>
  );
};

export const NFTContent = (p) => {
  return (
    <ContentBox>
      {p.meta?.content?.internal?.url ? (
        <img src={p.meta.content.internal.url} />
      ) : (
        ""
      )}
    </ContentBox>
  );
};

export const NFTPreview = (p) => {
  return (
    <Stack spacing="5" ml={"20px"} mt={"80px"}>
      <NFTContent meta={p} />
      <NFTInfo meta={p} />
      <NFTThumb meta={p} />
    </Stack>
  );
};

export const NFTThumb = (p) => {
  if (!p.meta?.thumb?.internal && !p.meta?.thumb?.external) return null;
  return (
    <Thumb {...p}>
      {p.meta?.thumb?.internal?.url ? (
        <img className="custom" src={p.meta.thumb.internal.url} />
      ) : (
        ""
      )}
      <div className="border" />
    </Thumb>
  );
};

export const NFTInfo = ({ meta }) => {
  const bg = useColorModeValue("white", "gray.700");
  const qcolor = itemQuality[meta.quality].color;
  if (!meta.name) return null;
  return (
    <Box bg={bg} borderRadius="md" borderWidth={"2px"} w={350} p={2}>
      {meta.content?.thumb?.url ? <img src={meta.content.thumb.url} /> : ""}

      <Stack spacing={0}>
        {meta.name ? (
          <Text color={qcolor} fontSize="16px">
            {meta.name.capitalize()}
          </Text>
        ) : null}
        {"bindsForever" in meta.transfer ? (
          <Text fontSize="14px">Binds on transfer</Text>
        ) : null}
        {"bindsDuration" in meta.transfer ? (
          <Text fontSize="14px">
            Binds on transfer for{" "}
            {moment.duration(meta.transfer.bindsDuration, "minutes").humanize()}
          </Text>
        ) : null}
        {meta?.use?.consumable?.desc ? (
          <Text fontSize="14px" color={"green"} as="i">
            Use: {meta.use.consumable.desc.capitalize()} (Consumed in the
            process)
          </Text>
        ) : null}

        {meta?.use?.cooldown?.desc ? (
          <Text fontSize="14px" color={"green.300"}>
            Use: {meta.use.cooldown.desc.capitalize()} (
            {moment.duration(meta.use.cooldown.duration, "minutes").humanize()}{" "}
            cooldown)
          </Text>
        ) : null}
        {meta.hold?.external?.desc ? (
          <Text fontSize="14px" color={"green.300"}>
            Hold: {meta.hold.external.desc.capitalize()}
          </Text>
        ) : null}
        {meta.attributes && meta.attributes.length
          ? meta.attributes.map((a, idx) => (
              <Text key={idx} fontSize="14px">
                {a[1] >= 0 ? "+" : ""}
                {a[1]} {a[0].capitalize()}
              </Text>
            ))
          : null}
        {meta.lore ? (
          <Text fontSize="14px" pt="14px" color={"yellow"}>
            "{meta.lore.capitalize()}"
          </Text>
        ) : null}
        {meta.ttl && meta.ttl > 0 ? (
          <Text fontSize="14px" pt="14px" color={"red"}>
            Lasts {moment.duration(meta.ttl, "minutes").humanize()}
          </Text>
        ) : null}
      </Stack>
    </Box>
  );
};
