import React, { useEffect, useState } from "react";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
} from "../index.js";
import styled from "@emotion/styled";

import { Text, Box, HStack, Spinner } from "@chakra-ui/react";
import { dialogResult } from "../reducers/dialog";

import {
  WarningIcon,
  InfoIcon,
  CheckCircleIcon,
  WarningTwoIcon,
} from "@chakra-ui/icons";

export const ToastHandler = () => {
  const toasts = useSelector((state) => state.toast.toasts);
  const dispatch = useDispatch();

  return (
    <ToastBox>
      {Object.keys(toasts).map((id) => {
        return <Toast key={id} {...toasts[id]} />;
      })}
    </ToastBox>
  );
};
const typeColors = {
  success: {
    bg: "green.500",
    fg: "green.50",
    icon: <CheckCircleIcon mt={"7px"} />,
  },
  error: { bg: "pink.500", fg: "pink.50", icon: <WarningTwoIcon mt={"7px"} /> },
  info: { bg: "blue.500", fg: "blue.50", icon: <InfoIcon mt={"7px"} /> },
  warning: {
    bg: "orange.500",
    fg: "orange.50",
    icon: <WarningIcon mt={"7px"} />,
  },
  loading: {
    bg: "blue.500",
    fg: "blue.50",
    icon: <Spinner size="sm" mt={2} />,
  },
};

const ToastBox = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  z-index: 10000;
`;

const Toast = ({ title, desc, type }) => {
  const tc = typeColors[type] || typeColors["success"];
  return (
    <Box
      mt={2}
      pt={2}
      pb={2}
      pr={4}
      pl={4}
      borderRadius={5}
      bg={tc.bg}
      color={tc.fg}
    >
      <HStack align={"top"}>
        {tc.icon}
        <Box>
          <Text fontSize="xl">{title}</Text>
          <Text fontSize="sm">{desc}</Text>
        </Box>
      </HStack>
    </Box>
  );
};
