import { MarketplaceLoad, MarketplaceFilters } from "../nftanvil-react";

import React, { useState, useEffect } from "react";
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
  Center,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
} from "@chakra-ui/react";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";
import { Inventory, InventoryLarge } from "../nftanvil-react";

import { useNavigate, useParams } from "react-router-dom";
import { useWindowSize } from "react-use";

export const Marketplace = ({ collections }) => {
  const { author } = useParams();
  let navigate = useNavigate();
  const [filterTags, setFilterTags] = useState([]);

  const { width, height } = useWindowSize();
  const mob = width < 900;

  const collection = collections.find((x) => x.author === author);

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
                <Box
                  spacing={10}
                  p={3}
                  alignItems={mob ? "center" : "start"}
                  as={mob ? Stack : HStack}
                >
                  <Stack
                    minW={"300px"}
                    maxW={mob ? null : "600px"}
                    pt={mob ? "10px" : "90px"}
                    align={mob ? "center" : null}
                  >
                    <Box fontSize="25px">{collection.name}</Box>
                    <Box>
                      <Wrap pl="4" spacing="8">
                        <Stat>
                          <StatLabel>Items</StatLabel>
                          <StatNumber>{collection.items}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Holders</StatLabel>
                          <StatNumber>{collection.holders}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Listed</StatLabel>
                          <StatNumber>{collection.for_sale}</StatNumber>
                        </Stat>

                        {stats ? (
                          <>
                            <Stat>
                              <StatLabel>Floor</StatLabel>
                              <StatNumber>{stats.floor}</StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>Mean</StatLabel>
                              <StatNumber>{stats.mean}</StatNumber>
                            </Stat>
                          </>
                        ) : null}
                      </Wrap>
                    </Box>
                    <FormControl>
                      <FormLabel>Sort</FormLabel>
                      {fOrder}
                    </FormControl>

                    {fQuality ? (
                      <FormControl>
                        <FormLabel>Quality</FormLabel>
                        {fQuality}
                      </FormControl>
                    ) : null}

                    {filterTags.length || tagsLeft.length ? (
                      <FormControl>
                        <FormLabel>Tags</FormLabel>
                        <Stack>
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
                        </Stack>
                      </FormControl>
                    ) : null}
                  </Stack>
                  <Box>
                    {mob ? (
                      <Center>
                        <HStack>
                          {goPageBack}
                          {goPageNext}
                        </HStack>
                      </Center>
                    ) : (
                      <Flex>
                        <Spacer />
                        <HStack>
                          {goPageBack}
                          {goPageNext}
                        </HStack>
                      </Flex>
                    )}

                    <InventoryLarge
                      width={mob ? width - 50 : 260}
                      height={mob ? width - 50 + 54 : 260 + 54}
                      items={slice.map((x) => tokenToText(x[0]))}
                      custom={(meta) => {
                        return (
                          <div style={{ paddingTop: "8px", width: "80%" }}>
                            {meta.name}
                          </div>
                        );
                      }}
                      onOpenNft={(id) => {
                        navigate(id); //, { replace: true }
                      }}
                    />
                    {mob ? (
                      <Center>
                        <HStack>
                          {goPageBack}
                          {goPageNext}
                        </HStack>
                      </Center>
                    ) : (
                      <Flex>
                        <Spacer />
                        <HStack>
                          {goPageBack}
                          {goPageNext}
                        </HStack>
                      </Flex>
                    )}
                  </Box>
                </Box>
              );
            }}
          </MarketplaceFilters>
        )}
      </MarketplaceLoad>
    </>
  );
};
