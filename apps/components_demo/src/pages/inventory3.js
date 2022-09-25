// import { Inventory } from "@vvv-interactive/nftanvil-react/cjs/components/Inventory";

import {
  Inventory,
  useAnvilDispatch,
  useAnvilSelector,
  tokenSelector,
} from "@vvv-interactive/nftanvil-react";
import { Stack, Button, Box, Center } from "@chakra-ui/react";
import { Code } from "../Code";

export function PageInventory3() {
  let dispatch = useAnvilDispatch();

  const accounts = useAnvilSelector((state) => state.user.accounts);
  let address = Object.keys(accounts)[0];

  return (
    <>
      <Code code={``} />
      <Center>
        <Stack direction="horizontal">
          <Inventory address={address} cols={5} rows={3} />
          {/* <Requirements tokens={[
            { t: 0, author: "a00903c0d031a9a99a5d760f4cb64a5025eedb29513f2488186caaf1ed6c685e", quality: ">=5" },
            { t: 1, amount : "500000"},
            { t: 2, amount : "500000"},
          ]}/> */}
        </Stack>
      </Center>
    </>
  );
}
