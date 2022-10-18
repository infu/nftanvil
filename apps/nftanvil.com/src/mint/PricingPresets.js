import React, { useEffect, useState } from "react";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
  nft_mint_quote,
  ICP,
} from "../nftanvil-react";

import {
  Box,
  Text,
  useRadio,
  HStack,
  useRadioGroup,
  Tooltip,
  Spinner,
  Skeleton,
} from "@chakra-ui/react";
import { useDebounce } from "react-use";

const DUR_IN_MINUTES = 1036800; // 2 years

export const presets = {
  "ic-lite": {
    storage: "internal",
    ttl: DUR_IN_MINUTES,
  },
  "ic-premium": { storage: "internal", ttl: null },
  ipfs: { storage: "ipfs", ttl: DUR_IN_MINUTES },
};

export const PwrPrice = ({ record, valid }) => {
  const [pwrPrice, setPwrPrice] = useState(0);
  const dispatch = useDispatch();

  useDebounce(
    () => {
      if (!valid) return;
      // setPwrPrice(0);
      dispatch(nft_mint_quote(record)).then((re) => {
        setPwrPrice(re.ops + re.storage);
      });
    },
    300,
    [record, valid, dispatch]
  );

  return (
    <Box textAlign={"center"} h={30}>
      {pwrPrice ? <ICP>{pwrPrice}</ICP> : ""}
    </Box>
  );
};

const changeToStorage = (x, s) => {
  if (!x) return x;
  let v = x[Object.keys(x)[0]];
  return { [s]: v };
};

function OptionIcPremium({ record, valid }) {
  let { ttl, content, thumb, quality } = record;
  let changed = {
    ttl: null,
    content: changeToStorage(content, "internal"),
    thumb: changeToStorage(thumb, "internal"),
    quality,
  };
  return (
    <>
      <PwrPrice record={changed} valid={valid} />
    </>
  );
}

export function PricingPresets({ onChange, valid, record }) {
  return <OptionIcPremium valid={valid} record={record} />;
}

export function PresetBox(props) {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label" w="100%">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: "blue.900",
          color: "white",
          borderColor: "blue.600",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        px={3}
        py={3}
      >
        {props.children}
      </Box>
    </Box>
  );
}
