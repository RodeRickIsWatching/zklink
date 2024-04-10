import { atom } from "recoil";
import { localStorageEffect } from "../_util/localStorageEffect";
import { LOCALE_THEME, WALLET_WAY } from "@/config/index";

export const recoilTheme = atom<"dark" | "light">({
    key: "theme",
    default: "dark",
    effects_UNSTABLE: [localStorageEffect<"dark" | "light">(LOCALE_THEME)],
});

export const recoilSelectedWallet = atom<string>({
    key: "selectedWallet",
    default: "",
    effects_UNSTABLE: [localStorageEffect<string>(WALLET_WAY)],
});

export const recoilProviderFromMessage = atom<string | null>({
    key: "providerFromMessage",
    default: null,
});

// export const recoilDBWithdrawTxs = atom<any>({
//     key: "dbWithdrawTxs",
//     default: {},
//     effects_UNSTABLE: [indexedDBEffect<string>('withdrawal-txs')],
// });
