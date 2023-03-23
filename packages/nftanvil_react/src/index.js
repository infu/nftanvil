import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { router } from "@vvv-interactive/nftanvil-canisters/cjs/router.js";
import { combineEpics } from "redux-observable";
import { createEpicMiddleware } from "redux-observable";
import { activeEpics } from "./epics.js";
import userReducer, {
  user_login,
  user_login_ii,
  user_logout,
  user_refresh_balances,
  user_refresh_config,
  user_transfer_icp,
  user_refresh_all_balances,
  user_set_main_account,
} from "./reducers/user";
import historyReducer, {
  history_load_info,
  history_load,
} from "./reducers/history";

import { NftHistory, HistoryEvent } from "./components/History";
import { LoginRequired } from "./components/LoginRequired";
import { ChakraProvider } from "@chakra-ui/react";
import identities from "./identities.js";

import {
  Provider,
  createStoreHook,
  createDispatchHook,
  createSelectorHook,
} from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

import { DialogHandler } from "./components/DialogHandler";
import inventoryReducer, {
  inv_container_unlock,
  inv_containers_list,
  inv_accept_offer,
  inv_offer_info,
  inv_send_temporary,
  inv_create_offer,
  inv_clear_temporary,
  load_inventory,
  load_author,
  tokenSelector,
} from "./reducers/inventory";
import * as icons from "./icons";
import dialogReducer, { dialog_open } from "./reducers/dialog";

import { Auth, AuthII } from "./components/Auth";
import { AccountIcon } from "./components/AccountIcon";

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

import ftReducer, {
  ft_transfer,
  ft_all_tokens,
  ft_fetch_meta,
  ft_mint,
  ft_promote,
} from "./reducers/ft";

import uiReducer, {
  window_focus,
  window_blur,
  ui_pro_set,
} from "./reducers/ui";

import dexReducer, {
  dex_create_pool,
  dex_add_liquidity,
  dex_rem_liquidity,
  dex_swap,
  dex_pools,
  dex_add_liquidity_dialog,
} from "./reducers/dex";

import { FTSelect, FT, FTMeta, FTImage, FTAbstract } from "./components/FT";
import icReducer, { anvil_discover } from "./reducers/ic";
import verifyReducer, {
  verify_domain_twitter,
  verify_domain,
} from "./reducers/verify";

import toastReducer, { toast_create, toast_update } from "./reducers/toast";
import taskReducer, { task_start, task_end, task_run } from "./reducers/task";
import { TaskButton } from "./components/TaskButton";
import { ColorModeScript } from "@chakra-ui/react";
import { ToastHandler } from "./components/ToastHandler";
import { Inventory, Offers } from "./components/Inventory";

import { InventoryLarge } from "./components/InventoryLarge";

import { TX, ICP, ANV, ACC, PRI, NFTA, HASH, FTI } from "./components/Code";
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
  NFT,
} from "./components/NFT";
import { useDexPools, useFT, useInventoryToken } from "./Hooks";
export { useDexPools, useFT, useInventoryToken };
export { InventoryLarge };
export { FTSelect, FT, FTMeta, FTImage, FTAbstract };
export { TX, ICP, ANV, ACC, PRI, NFTA, FTI, HASH };
export { Inventory, Offers };
export { ui_pro_set };
export {
  dex_create_pool,
  dex_add_liquidity,
  dex_rem_liquidity,
  dex_swap,
  dex_pools,
  dex_add_liquidity_dialog,
};
export { icons };
export { TaskButton };
export { ft_transfer, ft_all_tokens, ft_mint, ft_fetch_meta, ft_promote };
export { Auth, AuthII };
export { task_start, task_end, task_run };
export { LoginRequired, NftHistory, HistoryEvent };
export { MarketplaceLoad, MarketplaceFilters };
export { history_load_info, history_load };
export { NFT, NFTContent, NFTInfo, NFTThumb, NFTMenu, NFTProInfo, NFTPreview };
export { toast_create, toast_update };
export { dialog_open };
export { AccountIcon };
export {
  inv_container_unlock,
  inv_containers_list,
  inv_accept_offer,
  inv_offer_info,
  inv_clear_temporary,
  inv_send_temporary,
  inv_create_offer,
  load_author,
  load_inventory,
  verify_domain,
  verify_domain_twitter,
  tokenSelector,
};
export { identities };
export {
  user_login,
  user_login_ii,
  user_logout,
  user_refresh_balances,
  user_refresh_config,
  user_transfer_icp,
  user_set_main_account,
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
    task: taskReducer,
    nft: nftReducer,
    ft: ftReducer,
    inventory: inventoryReducer,
    dialog: dialogReducer,
    toast: toastReducer,
    ic: icReducer,
    ui: uiReducer,
    verify: verifyReducer,
    history: historyReducer,
    dex: dexReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true }).concat(epicMiddleware),
});

const rootEpic = combineEpics(...activeEpics);

epicMiddleware.run(rootEpic);

function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

export function AnvilProvider({ children }) {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />

      <Provider context={MyContext} store={store}>
        <ChakraProvider theme={theme}>
          <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
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
  // await store.dispatch(user_auth());
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
