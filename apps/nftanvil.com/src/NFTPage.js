import React, { useState, useEffect } from "react";

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack,
  Center,
  Button,
} from "@chakra-ui/react";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
  NFTContent,
  NFTInfo,
  NFTThumb,
  NFTMenu,
  NFTProInfo,
  LoginRequired,
  NftHistory,
  nft_fetch,
  nft_claim_link,
} from "./nftanvil-react/";
import { useParams } from "react-router-dom";

export const NFTPage = ({ address, code, renderButtons }) => {
  let param = useParams();
  console.log("NFTPage", param);
  const id = "nfta" + param.id;

  const meta = useSelector((state) => state.nft[id]);
  // s.ic.anvil.space
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(nft_fetch(id));
  }, [id, dispatch]);

  const onClaim = async () => {
    setClaiming(true);
    setError(false);

    let resp = await dispatch(nft_claim_link({ code }));
    setClaiming(false);

    if (resp.ok !== undefined) {
      setClaimed(true);
    } else {
      setError(true);
    }
  };

  const accounts = useSelector((state) => state.user.accounts);

  if (!meta) return null;

  const owner = meta.bearer in accounts;

  return (
    <Stack ml={"10px"} mr={"10px"} mt={"4vh"}>
      <Center>
        <NFTContent meta={meta} />
      </Center>
      <Center>
        <Stack>
          <NFTThumb meta={meta} />
          <NFTInfo id={id} meta={meta} />

          <NFTProInfo id={id} meta={meta} />
        </Stack>
      </Center>

      <Center>
        <NFTMenu
          nobuy={!claimed && code}
          owner={owner}
          id={id}
          meta={meta}
          renderButtons={renderButtons}
        />
      </Center>

      {claimed ? (
        <>
          <Alert status="success">
            <AlertIcon />
            <AlertTitle mr={2}>Claiming sucess!</AlertTitle>
            <AlertDescription>
              The NFT is now yours. This link can't be used again.
            </AlertDescription>
          </Alert>
        </>
      ) : null}
      {!claimed && code ? (
        <>
          <Center>
            <LoginRequired label="Authenticate to claim">
              <Button
                isLoading={claiming}
                loadingText="Claiming"
                onClick={onClaim}
                colorScheme="teal"
                size="lg"
              >
                Claim NFT
              </Button>
            </LoginRequired>
          </Center>

          {error ? (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle mr={2}>Claiming failed!</AlertTitle>
              <AlertDescription>
                Perhaps someone else claimed this code before you or it's not
                valid
              </AlertDescription>
            </Alert>
          ) : null}
        </>
      ) : null}
      {meta.history ? (
        <NftHistory transactions={meta.history} showThumb={false} />
      ) : null}
    </Stack>
  );
};
