import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import { combineEpics } from "redux-observable";
import { createEpicMiddleware } from "redux-observable";
import { activeEpics } from "./epics.js";
import userReducer, {
  user_auth,
  user_login,
  user_logout,
  user_refresh_balances,
  user_refresh_config,
  user_transfer_icp,
  user_refresh_all_balances,
} from "./reducers/user";
import historyReducer, {
  history_load_info,
  history_load,
} from "./reducers/history";

import { NftHistory, HistoryEvent } from "./components/History";
import { LoginRequired } from "./components/LoginRequired";
import { ChakraProvider } from "@chakra-ui/react";

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

import nftReducer, {
  nft_fetch,
  nft_media_get,
  nft_purchase,
  nft_transfer,
  nft_plug,
  nft_unsocket,
  nft_recharge,
  nft_burn,
  nft_use,
  nft_transfer_link,
  nft_claim_link,
  nft_enter_code,
  nft_recharge_quote,
  nft_set_price,
  nft_mint,
  nft_mint_quote,
} from "./reducers/nft";

import ftReducer, { ft_transfer } from "./reducers/ft";

import uiReducer, {
  window_focus,
  window_blur,
  ui_pro_set,
} from "./reducers/ui";

import icReducer, { anvil_discover } from "./reducers/ic";
import verifyReducer, {
  verify_domain_twitter,
  verify_domain,
} from "./reducers/verify";

import toastReducer, { toast_create, toast_update } from "./reducers/toast";

import { ColorModeScript } from "@chakra-ui/react";
import { ToastHandler } from "./components/ToastHandler";
import { Inventory } from "./components/Inventory";

import { InventoryLarge } from "./components/InventoryLarge";

import { TX, ICP, ACC, PRI, NFTA, HASH } from "./components/Code";
import { theme } from "./theme.js";
import {
  MarketplaceLoad,
  MarketplaceFilters,
} from "./components//Marketplace.js";
import {
  NFTContent,
  NFTInfo,
  NFTThumb,
  NFTMenu,
  NFTProInfo,
  NFTPreview,
} from "./components/NFT";

export { InventoryLarge };

export { TX, ICP, ACC, PRI, NFTA, HASH };
export { Inventory };
export { ui_pro_set };
export { ft_transfer };
export { Auth };

export { LoginRequired, NftHistory, HistoryEvent };
export { MarketplaceLoad, MarketplaceFilters };
export { history_load_info, history_load };
export { NFTContent, NFTInfo, NFTThumb, NFTMenu, NFTProInfo, NFTPreview };
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
};

export {
  nft_fetch,
  nft_mint,
  nft_mint_quote,
  nft_media_get,
  nft_purchase,
  nft_transfer,
  nft_plug,
  nft_unsocket,
  nft_recharge,
  nft_burn,
  nft_use,
  nft_transfer_link,
  nft_claim_link,
  nft_enter_code,
  nft_recharge_quote,
  nft_set_price,
};

const MyContext = React.createContext(null);

// Export your custom hooks if you wish to use them in other files.
export const useAnvilStore = createStoreHook(MyContext);
export const useAnvilDispatch = createDispatchHook(MyContext);
export const useAnvilSelector = createSelectorHook(MyContext);

const epicMiddleware = createEpicMiddleware();

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
    history: historyReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true }).concat(epicMiddleware),
});

const rootEpic = combineEpics(...activeEpics);

epicMiddleware.run(rootEpic);

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
  window.addEventListener("focus", () => {
    store.dispatch(window_focus());
    store.dispatch(user_refresh_all_balances());
  });
  window.addEventListener("blur", () => store.dispatch(window_blur()));
}
