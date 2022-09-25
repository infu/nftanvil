import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";

import {
  Provider,
  createStoreHook,
  createDispatchHook,
  createSelectorHook,
} from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DialogHandler } from "./components/DialogHandler";
import inventoryReducer, {
  load_inventory,
  load_author,
  tokenSelector,
} from "./reducers/inventory";

import dialogReducer, { dialog_open } from "./reducers/dialog";

import { Auth } from "./components/Auth";
export { Auth };

import userReducer, {
  user_auth,
  user_login,
  user_logout,
  user_refresh_balances,
  user_refresh_config,
  user_transfer_icp,
  user_transfer_token,
} from "./reducers/user";

import nftReducer, {
  nft_fetch,
  nft_media_get,
  nft_purchase,
  nft_transfer,
  nft_plug,
  nft_unsocket,
  nft_recharge,
  nft_burn,
  nft_approve,
  nft_use,
  nft_transfer_link,
  nft_claim_link,
  nft_enter_code,
  nft_recharge_quote,
  nft_set_price,
} from "./reducers/nft";

import ftReducer from "./reducers/ft";
import uiReducer, { window_focus, window_blur } from "./reducers/ui";

import icReducer, { anvil_discover } from "./reducers/ic";
import verifyReducer, {
  verify_domain_twitter,
  verify_domain,
} from "./reducers/verify";

import toastReducer, { toast_create, toast_update } from "./reducers/toast";

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeScript } from "@chakra-ui/react";
import { theme } from "./theme.js";
import { ToastHandler } from "./components/ToastHandler";
import { Inventory } from "./components/Inventory";
export { Inventory };
import { InventoryLarge } from "./components/InventoryLarge";
export { InventoryLarge };
export { toast_create, toast_update };
export { dialog_open };
export {
  load_author,
  load_inventory,
  verify_domain,
  verify_domain_twitter,
  tokenSelector,
};

export {
  user_auth,
  user_login,
  user_logout,
  user_refresh_balances,
  user_refresh_config,
  user_transfer_icp,
  user_transfer_token,
};

export {
  nft_fetch,
  nft_media_get,
  nft_purchase,
  nft_transfer,
  nft_plug,
  nft_unsocket,
  nft_recharge,
  nft_burn,
  nft_approve,
  nft_use,
  nft_transfer_link,
  nft_claim_link,
  nft_enter_code,
  nft_recharge_quote,
  nft_set_price,
};

export const TestAnvilComponent = () => {
  return <div>fun component sweet 123 123 123</div>;
};

const MyContext = React.createContext(null);

// Export your custom hooks if you wish to use them in other files.
export const useAnvilStore = createStoreHook(MyContext);
export const useAnvilDispatch = createDispatchHook(MyContext);
export const useAnvilSelector = createSelectorHook(MyContext);

export const store = configureStore({
  // devTools: { name: "Anvil" },
  reducer: {
    user: userReducer,
    nft: nftReducer,
    ft: ftReducer,
    inventory: inventoryReducer,
    dialog: dialogReducer,
    toast: toastReducer,
    ic: icReducer,
    ui: uiReducer,
    verify: verifyReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export function AnvilProvider({ children }) {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Provider context={MyContext} store={store}>
        <ChakraProvider theme={theme}>
          <DndProvider backend={HTML5Backend}>
            {children}
            <ToastHandler />
            <DialogHandler />
          </DndProvider>
        </ChakraProvider>
      </Provider>
    </>
  );
}

// Extra
const init = async () => {
  await store.dispatch(anvil_discover());
  await store.dispatch(user_auth());
};

router.setOptions(process.env.REACT_APP_ROUTER_CANISTER_ID, {}); // maybe figure a better way without breaking everything else

setTimeout(init, 100);

if (typeof window !== "undefined") {
  window.addEventListener("focus", () => store.dispatch(window_focus()));
  window.addEventListener("blur", () => store.dispatch(window_blur()));
}
