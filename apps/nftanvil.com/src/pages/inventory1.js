import {
  Inventory,
  useAnvilDispatch,
  useAnvilSelector,
  tokenSelector,
} from "../nftanvil-react/";
import { Stack, Button, Box, Center } from "@chakra-ui/react";

export function PageInventory1() {
  let dispatch = useAnvilDispatch();

  const accounts = useAnvilSelector((state) => state.user.accounts);
  let address = Object.keys(accounts)[0];

  return (
    <>
      <Center>
        <Stack direction="horizontal">
          <Inventory address={address} cols={5} rows={3} />
        </Stack>
      </Center>
    </>
  );
}
