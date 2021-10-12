import { createIcon } from "@chakra-ui/react";

export const Zap = createIcon({
  displayName: "Zap",
  viewBox: "0 0 24 24",
  // path can also be an array of elements, if you have multiple paths, lines, shapes, etc.
  path: (
    <polygon
      fill="currentColor"
      points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
    ></polygon>
  ),
});
