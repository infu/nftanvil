import { MarketplaceLoad, MarketplaceFilters } from "../nftanvil-react";

import React, { useState } from "react";
import { tokenToText } from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import {
  IconButton,
  Flex,
  Spacer,
  Select,
  Text,
  Box,
  Button,
  Stack,
  HStack,
  Wrap,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

import { Inventory, InventoryLarge } from "../nftanvil-react";

import { useNavigate, useParams } from "react-router-dom";

export const Marketplace = () => {
  const { author } = useParams();
  let navigate = useNavigate();
  const [filterTags, setFilterTags] = useState([]);

  return (
    <>
      <MarketplaceLoad author={author} key={author}>
        {(items) => (
          <MarketplaceFilters items={items} filterTags={filterTags}>
            {({
              goPageBack,
              goPageNext,
              stats,
              fOrder,
              fQuality,
              fTags,
              slice,
              tagsLeft,
            }) => {
              return (
                <HStack spacing={10} p={3} alignItems="start">
                  <Stack minW={"300px"} maxW={"600px"} pt="90px">
                    {fOrder}
                    {fQuality}
                    {fTags}

                    {filterTags.map((tag) => (
                      <Flex key={tag}>
                        <Text pl="4">{tag}</Text>
                        <Spacer />
                        <IconButton
                          icon={<CloseIcon />}
                          size="xs"
                          ml="2"
                          onClick={() => {
                            setFilterTags([
                              ...filterTags.filter((x) => x !== tag),
                            ]);
                          }}
                        />
                      </Flex>
                    ))}
                    {tagsLeft.length ? (
                      <Select
                        onChange={(e) => {
                          if (e.target.value === "-") return;
                          setFilterTags([...filterTags, e.target.value]);
                          e.target.value = null;
                        }}
                      >
                        <option value="-">select</option>
                        {tagsLeft.map((tag, tagidx) => (
                          <option key={tagidx} value={tag}>
                            {tag}
                          </option>
                        ))}
                      </Select>
                    ) : null}
                    <Text pl="4">
                      {stats ? <div>Floor: {stats.floor}</div> : null}
                      {stats ? <div>Mean: {stats.mean}</div> : null}
                    </Text>
                  </Stack>

                  <Box>
                    <Flex>
                      <Spacer />
                      <HStack>
                        {goPageBack}
                        {goPageNext}
                      </HStack>
                    </Flex>

                    <InventoryLarge
                      items={slice.map((x) => tokenToText(x[0]))}
                      custom={(meta) => {
                        return (
                          <div style={{ paddingTop: "8px", width: "80%" }}>
                            {meta.name}
                          </div>
                        );
                      }}
                      onOpenNft={(id) => {
                        navigate("/" + id); //, { replace: true }
                      }}
                    />
                    <Flex>
                      <Spacer />
                      <HStack>
                        {goPageBack}
                        {goPageNext}
                      </HStack>
                    </Flex>
                  </Box>
                </HStack>
              );
            }}
          </MarketplaceFilters>
        )}
      </MarketplaceLoad>
    </>
  );
};
