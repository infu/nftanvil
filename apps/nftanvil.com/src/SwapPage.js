/* global BigInt */

import React, { useState, useEffect } from "react";

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
  FTAbstract,
  ft_fetch_meta,
  dex_add_liquidity_dialog,
  dex_rem_liquidity,
  useDexPools,
  useFT,
  dialog_open,
  FTI,
} from "@vvv-interactive/nftanvil-react";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

import {
  Box,
  Button,
  HStack,
  Wrap,
  Center,
  Text,
  Stack,
} from "@vvv-interactive/nftanvil-react/src/chakra.js";

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@vvv-interactive/nftanvil-react/src/chakra.js";

export const SwapPage = () => {
  const dispatch = useDispatch();
  const address = useSelector((s) => s.user.main_account);
  const pools = useDexPools(address);
  if (!pools) return null;

  return (
    <Box>
      <Center>
        <Wrap overflow={true} maxW={"900px"} spacing={8} justify="center">
          {Object.keys(pools).map((k) => (
            <DexPool
              address={address}
              key={pools[k].id[0] + "-" + pools[k].id[1]}
              {...pools[k]}
            />
          ))}
        </Wrap>
      </Center>
    </Box>
  );
};

const DexPool = ({
  address,
  id,
  balance,
  reserve_one,
  token_one_decimals,
  reserve_two,
  token_two_decimals,
  total,
}) => {
  const meta_one = useFT(id[0]);
  const meta_two = useFT(id[1]);

  const dispatch = useDispatch();

  if (!meta_one || !meta_two) return null;

  const rone = Number(reserve_one) / 10 ** token_one_decimals;
  const rtwo = Number(reserve_two) / 10 ** token_two_decimals;

  const first_primary = "fractionless" in meta_one.kind ? false : true;

  const has_liquidity = rone !== 0n && rtwo !== 0n;

  let my_share = balance / total;
  let bal_one = Math.floor(Number(reserve_one) * my_share);
  let bal_two = Math.floor(Number(reserve_two) * my_share);

  return (
    <Box
      border={"1px"}
      borderRadius="5"
      p={3}
      borderColor="gray.600"
      bg={"gray.800"}
    >
      <Center>
        {has_liquidity ? (
          <Box>
            {!first_primary ? (
              <HStack>
                <FTAbstract id={id[0]} bal={1 * 10 ** token_one_decimals} />
                <FTAbstract
                  id={id[1]}
                  bal={Math.round(
                    (1 / Number(rone / rtwo)) * 10 ** token_two_decimals
                  )}
                />
              </HStack>
            ) : (
              <HStack>
                <FTAbstract
                  id={id[0]}
                  bal={Math.round(
                    (1 / Number(rtwo / rone)) * 10 ** token_one_decimals
                  )}
                />
                <FTAbstract id={id[1]} bal={1 * 10 ** token_two_decimals} />
              </HStack>
            )}
          </Box>
        ) : (
          <Box>No liquidity</Box>
        )}
      </Center>

      <TableContainer>
        <Table size="sm">
          <Tbody>
            <Tr>
              <Td>{meta_one.symbol} reserve</Td>
              <Td isNumeric>
                {"fractionless" in meta_one.kind
                  ? reserve_one
                  : (reserve_one / 10 ** token_one_decimals).toFixed(4)}
              </Td>
            </Tr>
            <Tr>
              <Td>{meta_two.symbol} reserve</Td>
              <Td isNumeric>
                {"fractionless" in meta_two.kind
                  ? reserve_two
                  : (reserve_two / 10 ** token_two_decimals).toFixed(4)}
              </Td>
            </Tr>
            {my_share > 0 ? (
              <>
                <Tr>
                  <Td>your share</Td>
                  <Td isNumeric>{(my_share * 100).toFixed(4)}%</Td>
                </Tr>
                <Tr>
                  <Td>share of {meta_one.symbol}</Td>
                  <Td isNumeric>
                    {"fractionless" in meta_one.kind
                      ? bal_one
                      : (bal_one / 10 ** token_one_decimals).toFixed(4)}
                  </Td>
                </Tr>
                <Tr>
                  <Td>share of {meta_two.symbol}</Td>
                  <Td isNumeric>
                    {"fractionless" in meta_two.kind
                      ? bal_two
                      : (bal_two / 10 ** token_two_decimals).toFixed(4)}
                  </Td>
                </Tr>
              </>
            ) : null}
          </Tbody>
        </Table>
      </TableContainer>

      <Stack mt={4}>
        <Button
          onClick={() => {
            dispatch(
              dialog_open({
                name: "dex_swap",
                data: {
                  address,
                  token_one_id: id[0],
                  token_two_id: id[1],
                },
              })
            );
          }}
        >
          Swap
        </Button>
        <Button
          variant={"outline"}
          size="xs"
          onClick={() => {
            dispatch(
              dex_add_liquidity_dialog({
                address,
                token_one_id: id[0],
                token_two_id: id[1],
                rate: Number(rone / rtwo),
              })
            );
          }}
        >
          Add liquidity
        </Button>
        {my_share > 0 ? (
          <Button
            variant={"outline"}
            size="xs"
            onClick={() => {
              dispatch(
                dex_rem_liquidity(address, {
                  token_one: id[0],
                  token_two: id[1],
                })
              );
            }}
          >
            Remove liquidity
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
};
