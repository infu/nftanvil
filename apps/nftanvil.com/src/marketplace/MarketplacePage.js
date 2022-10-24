import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Center,
  HStack,
  Wrap,
  Text,
  Image,
} from "@chakra-ui/react";
import { Routes, Route, Link, Outlet } from "react-router-dom";

export const MarketplaceRoute = () => {
  return <Outlet />;
};

export const MarketplaceIndex = ({ collections }) => {
  return (
    <>
      <Center mt="80px">
        <Wrap spacing={25} mr="10" ml="10" justify={"center"} w={1000}>
          {collections.map((x, idx) => (
            <Link to={x.author} key={idx}>
              <Box
                w={300}
                h={300}
                borderRadius={5}
                sx={{
                  position: "relative",
                  backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)), url(${x.cover})`,
                  backgroundSize: "120%",
                  backgroundPosition: "center",
                }}
              >
                <Text
                  sx={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    position: "absolute",
                    bottom: "14px",
                    left: "13px",
                    right: "13px",
                  }}
                >
                  {x.name}
                </Text>
              </Box>
            </Link>
          ))}
        </Wrap>
      </Center>
    </>
  );
};
