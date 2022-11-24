import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Center,
  HStack,
  Wrap,
  Text,
  Image,
  Stack,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { Routes, Route, Link, Outlet } from "react-router-dom";

import { ArrowForwardIcon } from "@chakra-ui/icons";
import { NFT } from "../nftanvil-react/";
export const MarketplaceRoute = () => {
  return <Outlet />;
};

export const MarketplaceIndex = ({ collections }) => {
  return (
    <>
      <Center mt="80px" pb="100px">
        <Stack spacing={25} mr="10" ml="10" justify={"center"} w={900}>
          {collections.map((x, idx) => (
            <Flex key={idx}>
              <Link to={x.author}>
                <Box
                  w={"300px"}
                  h="300px"
                  borderRadius={"10px 0px 0px 10px"}
                  sx={{
                    position: "relative",
                    backgroundImage: `url(${x.cover})`, //linear-gradient(to top left, rgba(0, 0, 0, 20%), rgb(64 39 108 / 27%), rgb(205 170 246)),
                    backgroundSize: "120%",
                    backgroundPosition: "center",
                  }}
                ></Box>
              </Link>
              <Box
                bg={
                  "linear-gradient(339deg, rgb(31 29 46) 0%, rgb(38 31 44) 100%);"
                }
                w="100%"
                pl="30px"
                pt="20px"
                pr="30px"
                sx={{ position: "relative" }}
                borderRadius="0px 10px 10px 0px"
              >
                <Text
                  sx={{
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  {x.name}
                </Text>
                {x.website.length > 0 ? (
                  <Text fontSize="xs" color="gray.300">
                    website:{" "}
                    <a
                      target="_blank"
                      href={"https://" + x.website}
                      rel="noreferrer"
                    >
                      {x.website}
                    </a>
                  </Text>
                ) : null}

                <Text mt={3}>{x.description}</Text>

                <Box
                  sx={{ position: "absolute", left: "30px", bottom: "16px" }}
                >
                  <HStack>
                    <NFT token={{ id: x.sample_1 }} />
                    <NFT token={{ id: x.sample_2 }} />
                    <NFT token={{ id: x.sample_3 }} />
                  </HStack>
                </Box>

                <Box
                  sx={{ position: "absolute", right: "16px", bottom: "16px" }}
                >
                  <Link to={x.author} key={idx}>
                    <Button bg="#5b2480" rightIcon={<ArrowForwardIcon />}>
                      View collection
                    </Button>
                  </Link>
                </Box>
              </Box>
            </Flex>
          ))}
        </Stack>
      </Center>
    </>
  );
};
