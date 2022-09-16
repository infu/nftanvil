import React from "react";
import { configureStore } from "@reduxjs/toolkit";
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
  verify_domain_twitter,
  verify_domain,
  load_author,
} from "./reducers/inventory";

import dialogReducer from "./reducers/dialog";

import userReducer, {
  user_auth,
  user_login,
  user_logout,
  user_refresh_balances,
  user_refresh_config,
  user_transfer_icp,
  user_pwr_transfer,
  window_focus,
  window_blur,
} from "./reducers/user";

import nftReducer, {
  nft_fetch,
  nft_media_get,
  nft_purchase,
  // nft_purchase_intent,
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

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeScript } from "@chakra-ui/react";
import { theme } from "./theme.js";

export { load_author, load_inventory, verify_domain, verify_domain_twitter };

export {
  user_auth,
  user_login,
  user_logout,
  user_refresh_balances,
  user_refresh_config,
  user_transfer_icp,
  user_pwr_transfer,
};

export {
  nft_fetch,
  nft_media_get,
  nft_purchase,
  // nft_purchase_intent,
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
    inventory: inventoryReducer,
    dialog: dialogReducer,
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
            <DialogHandler />
          </DndProvider>
        </ChakraProvider>
      </Provider>
    </>
  );
}

// Extra

setTimeout(() => {
  store.dispatch(user_auth());
}, 100);

if (typeof window !== "undefined") {
  window.addEventListener("focus", () => store.dispatch(window_focus()));
  window.addEventListener("blur", () => store.dispatch(window_blur()));
}
