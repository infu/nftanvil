import {
  Inventory,
  useAnvilDispatch,
  useAnvilSelector,
  tokenSelector,
  ft_transfer,
} from "../nftanvil-react/";
import {
  principalToAccountIdentifier,
  getSubAccountArray,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { Stack, Button, Box, Center } from "@chakra-ui/react";
import { Code } from "../Code";

// export function PageInventory3() {
//   let dispatch = useAnvilDispatch();

//   const accounts = useAnvilSelector((state) => state.user.accounts);
//   let address = Object.keys(accounts)[0];

//   const floodrepeat = async () => {
//     while (true) {
//       await flood();
//     }
//   };

//   const flood = async () => {
//     await Promise.all(
//       Array(20)
//         .fill(0)
//         .map((_) => {
//           return floodOne();
//         })
//     ).then((x) => {
//       let total_ok = x.reduce((prev, cur) => {
//         return "ok" in cur ? prev + 1 : prev;
//       }, 0);
//       console.log("Total ok", total_ok);
//     });
//   };

//   const floodOne = () => {
//     let principal = accounts[address].principal;
//     let i = Math.round(Math.random() * 10000000000000);
//     let to = principalToAccountIdentifier(principal, i);
//     return dispatch(ft_transfer({ id: 4, address, to, amount: 30000 })).catch(
//       (e) => {
//         console.log(e);
//         return {};
//       }
//     );
//   };

//   return (
//     <>
//       <Center>
//         <Stack direction="horizontal">
//           <Button onClick={flood}>Flood</Button>
//           <Button onClick={floodrepeat}>Flood Repeat</Button>
//         </Stack>
//       </Center>
//     </>
//   );
// }
