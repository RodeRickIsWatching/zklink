export const MAX_ALLOWANCE =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export const isLocal = window.location.hostname === "localhost";

export const WALLET_WAY = 'walletway';

export const LOCALE_THEME = 'LOCALE_THEME'

export const isProd = import.meta.env.VITE_APP_ENV === "prod";

export const isQa = import.meta.env.VITE_APP_ENV === "qa";