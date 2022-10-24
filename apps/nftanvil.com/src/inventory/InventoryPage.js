import React, { useEffect, useRef, useState } from "react";

import {
  Inventory,
  useAnvilDispatch,
  useAnvilSelector,
  tokenSelector,
  dialog_open,
} from "../nftanvil-react";
import {
  Stack,
  Button,
  Center,
  Box,
  Text,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { LayoutOneIcon, LayoutTwoIcon } from "../nftanvil-react/icons";

export const InventoryPage = () => {
  let [count, setCount] = useState(1);
  return (
    <Center>
      <Stack>
        <Center>
          <HStack>
            <IconButton icon={<LayoutOneIcon />} onClick={() => setCount(1)} />
            <IconButton icon={<LayoutTwoIcon />} onClick={() => setCount(2)} />
          </HStack>
        </Center>
        {count === 1 ? "HEY" : "YO"}
        {count === 1 ? <InventorySingle /> : <InventoryDouble />}
      </Stack>
    </Center>
  );
};

export const InventorySingle = () => {
  let dispatch = useAnvilDispatch();
  const accounts = useAnvilSelector((state) => state.user.accounts);

  const [address1, setAddress1] = useState(Object.keys(accounts)[0]);

  const navigate = useNavigate();

  return (
    <Box>
      <Inventory
        key={address1}
        cols={10}
        rows={8}
        initialAddress={address1}
        onClickNft={(id) => {
          navigate("/" + id);
        }}
      />
    </Box>
  );
};

export const InventoryDouble = () => {
  let dispatch = useAnvilDispatch();
  const accounts = useAnvilSelector((state) => state.user.accounts);

  const [address1, setAddress1] = useState(Object.keys(accounts)[0]);
  const [address2, setAddress2] = useState(Object.keys(accounts)[1]);

  const navigate = useNavigate();

  return (
    <Stack direction="horizontal">
      <Box mr={4}>
        <Inventory
          key={address1}
          cols={5}
          rows={8}
          initialAddress={address1}
          onClickNft={(id) => {
            navigate("/" + id);
          }}
        />
      </Box>

      <Box>
        <Inventory
          key={address2}
          cols={5}
          rows={8}
          onClickNft={(id) => {
            navigate("/" + id);
          }}
          initialAddress={address2}
          onOpenNft={(id) => {}}
        />
      </Box>
    </Stack>
  );
};
