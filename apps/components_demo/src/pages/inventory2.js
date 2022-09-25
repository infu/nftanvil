import React, { useEffect, useRef, useState } from "react";

import {
  Inventory,
  useAnvilDispatch,
  useAnvilSelector,
  tokenSelector,
  dialog_open,
} from "@vvv-interactive/nftanvil-react/cjs/";
import { Stack, Button, Center, Box, Text, HStack } from "@chakra-ui/react";

export function PageInventory2() {
  let dispatch = useAnvilDispatch();
  const accounts = useAnvilSelector((state) => state.user.accounts);

  const [address1, setAddress1] = useState(Object.keys(accounts)[0]);
  const [address2, setAddress2] = useState(Object.keys(accounts)[1]);

  //a00c26536f73f0add51dddd5ef3220bb1842b2783e8ba1c4dd4a2da172b1727a

  return (
    <>
      <Center>
        <Stack direction="horizontal">
          <Box mr={4}>
            <Button
              size="sm"
              onClick={() =>
                dispatch(
                  dialog_open({
                    name: "select_account",
                  })
                ).then(setAddress1)
              }
            >
              Select Account 1
            </Button>
            {address1 ? (
              <Inventory
                key={address1}
                cols={5}
                rows={8}
                address={address1}
                onOpenNft={(id) => {}}
              />
            ) : null}
          </Box>

          <Box>
            <Button
              size="sm"
              onClick={() =>
                dispatch(
                  dialog_open({
                    name: "select_account",
                  })
                ).then(setAddress2)
              }
            >
              Select Account 2
            </Button>
            {address2 ? (
              <Inventory
                key={address2}
                cols={5}
                rows={8}
                address={address2}
                onOpenNft={(id) => {}}
              />
            ) : null}
          </Box>
        </Stack>
      </Center>
      {/* <Center>
        <Inventory cols={2} rows={5} address={"tmp1"} pagination={false} />
        <Inventory cols={2} rows={5} address={"tmp2"} pagination={false} />
      </Center> */}
      {/* <Center mt={10}>
        <HStack>
          <Button>Cancel</Button>
          <Button>Accept</Button>
        </HStack>
      </Center> */}
      <Text textAlign={"center"} color="gray.700" mt={20}>
        a00c26536f73f0add51dddd5ef3220bb1842b2783e8ba1c4dd4a2da172b1727a
      </Text>
    </>
  );
}
