import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
export const theme = extendTheme({
  textStyles: {},
  colors: {
    brand: {
      100: "#eeeeee",
    },
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  styles: {
    global: (props) => ({
      body: {
        fontFamily: "body",
        color: mode("gray.800", "whiteAlpha.900")(props),
        bg: mode("gray.400", "gray.800")(props),
        lineHeight: "base",
      },
      "*::placeholder": {
        color: mode("gray.400", "whiteAlpha.400")(props),
      },
      "*, *::before, &::after": {
        borderColor: mode("gray.200", "whiteAlpha.300")(props),
        wordWrap: "break-word",
      },
    }),
  },
});
