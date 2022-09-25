import {
  useAnvilDispatch,
  useAnvilSelector,
  tokenSelector,
  user_transfer_token,
  toast_create,
  dialog_open,
} from "@vvv-interactive/nftanvil-react/cjs/";
import { Stack, Wrap, Button, Center, Box } from "@chakra-ui/react";
import { Code } from "../Code";

export const PageDemoflow = () => {
  let dispatch = useAnvilDispatch();

  const accounts = useAnvilSelector((state) => state.user.accounts);
  const from_aid = Object.keys(accounts)[0];

  const token = useAnvilSelector(tokenSelector(from_aid, 1));

  const to_aid = Object.keys(accounts)[1];

  return (
    <>
      <Code
        code={`
// Declarative user flow programming
const demoflow = ({ from_aid, to_aid, token }) => async (dispatch, getState) => {
  while (true) {
    // open dialog
    let { amount } = await dispatch( dialog_open({ name: "transfer", 
    data: { from_aid, to_aid, token} }) );

    // confirm
    let { ok } = await dispatch( dialog_open({ name: "confirm", data: { 
    title: "Are you sure?", content: \`Do you really want to send \${amount}?\`, }, })
    ).catch((e) => ({ ok: false }));
    
    if (!ok) continue; // loop if not confirmed

    // make transfer
    await dispatch( user_transfer_token({ id: token.id, 
    address: from_aid, to: to_aid, amount }));

    // toast notification
    dispatch(toast_create({ title: "Success", 
    desc: \`Sent \${amount}\`, }));

    if (ok) break; // exit loop
  }};
`}
      />

      <Box p={10}>
        <Center>
          <Wrap>
            <Button
              onClick={() =>
                dispatch(
                  dialog_open({
                    name: "select_account",
                    data: {},
                  })
                )
              }
            >
              Account select
            </Button>

            <Button
              onClick={() => dispatch(demoflow({ token, from_aid, to_aid }))}
            >
              Demoflow
            </Button>
          </Wrap>
        </Center>
      </Box>
    </>
  );
};

const demoflow =
  ({ from_aid, to_aid, token }) =>
  async (dispatch, getState) => {
    while (true) {
      let { amount } = await dispatch(
        dialog_open({
          name: "transfer",
          data: {
            from_aid,
            to_aid,
            token,
          },
        })
      );

      let { ok } = await dispatch(
        dialog_open({
          name: "confirm",
          data: {
            title: "Are you sure?",
            content: `Do you really want to send ${amount}?`,
          },
        })
      ).catch((e) => ({ ok: false }));

      if (!ok) continue;

      await dispatch(
        user_transfer_token({
          id: token.id,
          address: from_aid,
          to: to_aid,
          amount,
        })
      );

      dispatch(
        toast_create({
          title: "Success",
          desc: `Sent ${amount}`,
        })
      );

      if (ok) break;
    }
  };
