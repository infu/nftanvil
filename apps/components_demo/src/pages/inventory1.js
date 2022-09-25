// import { Inventory } from "@vvv-interactive/nftanvil-react/cjs/components/Inventory";

import {
  Inventory,
  useAnvilDispatch,
  useAnvilSelector,
  tokenSelector,
} from "@vvv-interactive/nftanvil-react";
import { Stack, Button, Box, Center } from "@chakra-ui/react";
import { Code } from "../Code";

export function PageInventory1() {
  let dispatch = useAnvilDispatch();

  const accounts = useAnvilSelector((state) => state.user.accounts);
  let address = Object.keys(accounts)[0];

  return (
    <>
      <Code
        code={`<Inventory
    address={address}
    cols={5}
    rows={3}
/>
`}
      />
      <Center>
        <Stack direction="horizontal">
          <Inventory address={address} cols={5} rows={3} />
        </Stack>
      </Center>
    </>
  );
}
