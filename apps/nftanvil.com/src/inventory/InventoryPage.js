import React, { useEffect, useRef, useState } from "react";

import {
  Inventory,
  useAnvilDispatch,
  useAnvilSelector,
  tokenSelector,
  dialog_open,
  inv_clear_temporary,
  inv_send_temporary,
  inv_create_offer,
  TaskButton,
  task_start,
  task_end,
  task_run,
  inv_offer_info,
  FTAbstract,
  NFT,
  inv_accept_offer,
  Offers,
  icons,
} from "@vvv-interactive/nftanvil-react";
import {
  Stack,
  Button,
  Center,
  Box,
  Text,
  HStack,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { tokenToText } from "@vvv-interactive/nftanvil-tools/cjs/token.js";

import { ArrowForwardIcon, AddIcon } from "@chakra-ui/icons";

import { useWindowSize } from "react-use";

const { LayoutOneIcon, LayoutTwoIcon } = icons;
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
  const { url_address } = useParams();
  let dispatch = useAnvilDispatch();
  const main_address = useAnvilSelector((state) => state.user.main_account);
  const address = url_address || main_address;

  const [addressOne, setAddressOne] = useState(address);

  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const mob = width < 900;
  const cols = mob ? Math.floor(width / 90) : 10;
  return (
    <Box>
      <Inventory
        key={address}
        cols={cols}
        rows={mob ? 4 : 8}
        address={addressOne}
        onChangeAddress={setAddressOne}
        onClickNft={(id) => {
          navigate("/" + id);
        }}
      />

      <Offers address={address} />
    </Box>
  );
};

export const InventoryDouble = () => {
  const { url_address } = useParams();

  let dispatch = useAnvilDispatch();
  // const accounts = useAnvilSelector((state) => state.user.accounts);
  const address = useAnvilSelector((state) => state.user.main_account);

  const navigate = useNavigate();

  const task_id = address + "create_offer";

  const [addressOne, setAddressOne] = useState(address);
  const [addressTwo, setAddressTwo] = useState(url_address);

  const tmp_one = useAnvilSelector(
    (state) => state.inventory["tmp.attached." + addressOne]
  );
  const tmp_two = useAnvilSelector(
    (state) => state.inventory["tmp.attached." + addressTwo]
  );
  const { width, height } = useWindowSize();
  const mob = width < 900;
  const cols = mob ? Math.floor(width / 90) : 5;

  useEffect(() => {
    return () => {
      // unmount
      dispatch(inv_clear_temporary());
    };
  }, []);

  const tmp_one_has_content = tmp_one?.content
    ? Object.keys(tmp_one.content).length > 0
    : false;
  const tmp_two_has_content = tmp_two?.content
    ? Object.keys(tmp_two.content).length > 0
    : false;
  const onCreateOffer = () => {
    dispatch(
      task_run(
        task_id,
        async () => {
          let code = await dispatch(
            inv_create_offer({ from_aid: addressOne, to_aid: addressTwo })
          );

          navigator.clipboard.writeText("https://nftanvil.com/offer/" + code);
        },
        { successMsg: "Copied to clipboard" }
      )
    );
  };

  const onSend = () => {
    dispatch(inv_send_temporary({ from_aid: addressOne, to_aid: addressTwo }));
  };

  return (
    <Stack>
      <Box as={mob ? VStack : HStack}>
        <Box>
          <Inventory
            key={address}
            cols={cols}
            rows={mob ? 4 : 8}
            address={addressOne}
            onChangeAddress={setAddressOne}
            onClickNft={(id) => {
              navigate("/" + id);
            }}
          />
        </Box>

        <Box>
          <Inventory
            cols={cols}
            rows={mob ? 4 : 8}
            onChangeAddress={setAddressTwo}
            onClickNft={(id) => {
              navigate("/" + id);
            }}
            address={addressTwo}
            onOpenNft={(id) => {}}
          />
        </Box>
      </Box>
      <Box pt="5">
        <Center>
          {tmp_one_has_content && tmp_two_has_content ? (
            <TaskButton
              task_id={task_id}
              size="lg"
              colorScheme="purple"
              rightIcon={<AddIcon />}
              onClick={onCreateOffer}
            >
              Create offer
            </TaskButton>
          ) : null}
          {!tmp_one_has_content && tmp_two_has_content ? (
            <Button
              size="lg"
              colorScheme="purple"
              rightIcon={<ArrowForwardIcon />}
              onClick={onSend}
            >
              Send
            </Button>
          ) : null}
        </Center>
      </Box>
    </Stack>
  );
};

export const OfferPage = () => {
  const [offer, setOffer] = useState(null);
  const { code } = useParams();
  const task_id = "accept_offer";

  let dispatch = useAnvilDispatch();
  const address = useAnvilSelector((state) => state.user.main_account);

  useEffect(() => {
    dispatch(inv_offer_info(code)).then(setOffer);
  }, []);

  const onAcceptOffer = () => {
    dispatch(
      task_run(
        task_id,
        async () => {
          console.log("offer", offer);
          await dispatch(
            inv_accept_offer({
              aid: offer.code.aid,
              containerId: offer.code.containerId,
              my_tokens: offer.requirements,
            })
          );
        },
        { successMsg: "Success!" }
      )
    );
  };
  const displaySide = (tokens) => {
    return tokens.map((token, idx) => {
      if ("nft" in token) {
        return <NFT key={idx} token={{ id: tokenToText(token.nft.id) }} />;
      } else if ("ft" in token) {
        return (
          <FTAbstract
            key={idx}
            id={Number(token.ft.id).toString()}
            bal={Number(token.ft.balance)}
          />
        );
      }
    });
  };
  if (!offer) return null;
  return (
    <Center mt={"50px"}>
      <Stack w="400px" textAlign={"center"}>
        <HStack>
          <HStack>{displaySide(offer.requirements)}</HStack>
          <ArrowForwardIcon />
          <HStack>{displaySide(offer.tokens)}</HStack>
        </HStack>

        <TaskButton
          task_id={task_id}
          size="lg"
          colorScheme="purple"
          rightIcon={<ArrowForwardIcon />}
          onClick={onAcceptOffer}
        >
          Accept offer
        </TaskButton>
      </Stack>
    </Center>
  );
};
