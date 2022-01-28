import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { mint_quote } from "../reducers/nft";

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
import { TX, ACC, NFTA, HASH, PWR, ICP } from "./Code";

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
      dispatch(mint_quote(record)).then((re) => {
        setPwrPrice(re.transfer + re.ops + re.storage);
      });
    },
    300,
    [record, valid, dispatch]
  );

  return (
    <Box textAlign={"left"}>
      {!pwrPrice ? (
        <Skeleton height="20px" mt="4px" speed="5" />
      ) : (
        <>
          <ICP>{pwrPrice}</ICP>
        </>
      )}
    </Box>
  );
};

const changeToStorage = (x, s) => {
  if (!x) return x;
  let v = x[Object.keys(x)[0]];
  return { [s]: v };
};

function OptionIpfs({ record, valid }) {
  let { ttl, content, thumb, quality } = record;

  let changed = {
    ttl: DUR_IN_MINUTES,
    content: changeToStorage(content, "ipfs"),
    thumb: changeToStorage(thumb, "ipfs"),
    quality,
  };
  return (
    <>
      <Text
        fontSize="16px"
        fontFamily="Hexaframe"
        fontWeight="bold"
        color="orange"
      >
        TINY
      </Text>
      <Text fontSize="12px">Free IPFS storage</Text>
      <Text fontSize="12px">10% prepaid</Text>
      <PwrPrice record={changed} valid={valid} />
    </>
  );
}

function OptionIcLite({ record, valid }) {
  let { ttl, content, thumb, quality } = record;
  let changed = {
    ttl: DUR_IN_MINUTES,
    content: changeToStorage(content, "internal"),
    thumb: changeToStorage(thumb, "internal"),
    quality,
  };
  return (
    <>
      <Text
        fontSize="16px"
        fontFamily="Hexaframe"
        fontWeight="bold"
        color="orange"
      >
        HUGE
      </Text>
      <Text fontSize="12px">IC storage</Text>
      <Tooltip
        placement="top-start"
        label={
          "10% prepaid and the rest 90% is paid on sale or can be manually recharged. If none of these happens, the nft expires in 2 years"
        }
      >
        <Text fontSize="12px">10% prepaid</Text>
      </Tooltip>
      <PwrPrice record={changed} valid={valid} />
    </>
  );
}

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
      <Text
        fontSize="16px"
        fontFamily="Hexaframe"
        fontWeight="bold"
        color="orange"
      >
        L33T
      </Text>
      <Text fontSize="12px">IC storage</Text>
      <Text fontSize="12px">100% prepaid</Text>
      <PwrPrice record={changed} valid={valid} />
    </>
  );
}

export function PricingPresets({ onChange, valid, record }) {
  const options = {
    ipfs: <OptionIpfs valid={valid} record={record} />,
    "ic-lite": <OptionIcLite valid={valid} record={record} />,
    "ic-premium": <OptionIcPremium valid={valid} record={record} />,
  };

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "preset-tmp",
    defaultValue: "ic-lite",
    onChange,
  });

  const group = getRootProps();

  return (
    <HStack {...group} mt="4" align="top">
      {Object.keys(options).map((value) => {
        const radio = getRadioProps({ value });
        return (
          <PresetBox key={value} {...radio}>
            {options[value]}
          </PresetBox>
        );
      })}
    </HStack>
  );
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
