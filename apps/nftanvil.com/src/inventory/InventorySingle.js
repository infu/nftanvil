import React, { useEffect, useRef, useState } from "react";

import {
  Inventory,
  useAnvilDispatch,
  useAnvilSelector,
  tokenSelector,
  dialog_open,
} from "../nftanvil-react";
import { Stack, Button, Center, Box, Text, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const InventorySingle = () => {
  let dispatch = useAnvilDispatch();
  const accounts = useAnvilSelector((state) => state.user.accounts);

  const [address1, setAddress1] = useState(Object.keys(accounts)[0]);

  const navigate = useNavigate();

  return (
    <>
      <Center>
        <Stack direction="horizontal">
          <Box>
            <Text textAlign="center">
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
                Select Account
              </Button>
            </Text>
            {address1 ? (
              <Inventory
                key={address1}
                cols={10}
                rows={8}
                address={address1}
                onClickNft={(id) => {
                  navigate("/" + id);
                }}
              />
            ) : null}
          </Box>
        </Stack>
      </Center>
    </>
  );
};

/* <Center>
        <Inventory cols={2} rows={5} address={"tmp1"} pagination={false} />
        <Inventory cols={2} rows={5} address={"tmp2"} pagination={false} />
      </Center> */
/* <Center mt={10}>
        <HStack>
          <Button>Cancel</Button>
          <Button>Accept</Button>
        </HStack>
      </Center> */
