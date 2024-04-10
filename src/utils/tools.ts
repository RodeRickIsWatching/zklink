/* eslint-disable no-useless-catch */
import dayjs, { Dayjs } from "dayjs";
import UTC from "dayjs/plugin/utc";
import BigNumber from "bignumber.js";
import { uniq, uniqBy } from "lodash-es";
import type { Address } from "wagmi";
import { HttpTransport, PublicClient, createPublicClient, http } from "viem";
import { providers } from "ethers";

import { getPublicClient, type WalletClient, getWalletClient } from '@wagmi/core'

dayjs.extend(UTC);

type FormatType =
    | "DD/MM/YYYY"
    | "DD/MM/YYYY HH:mm:ss"
    | "HH:mm:ss"
    | "MM/DD"
    | "MM/DD HH:mm";

/**
 * UTC时间格式化
 * @param value
 * @param format
 * @returns
 */
export const filterTime = (
    value: string | number | Dayjs,
    format: FormatType = "DD/MM/YYYY"
) => {
    const stamp = typeof value === "number" ? value : Number(value);
    return dayjs.utc(stamp).local().format(format);
};

/**
 * 首字母大写
 * @param value
 * @returns
 */
export const filterTitleCase = (value: string) => {
    return value.toLowerCase().replace(/^\S/, (s) => s.toUpperCase());
};

/**
 * 数字精度 -> decimalPlaces[does not retain trailing zeros]
 * @param value
 * @param decimal
 * @returns
 */
export const filterPrecision = (
    value: string | number | undefined,
    decimal = 4
) => {
    if (!value || BigNumber(value).isNaN()) return "-";
    const result = new BigNumber(value)
        .toFixed(decimal, BigNumber.ROUND_DOWN)
        .toString();
    return result;
};

/**
 * 数字千位分割
 * @param value
 * @param decimal
 * @param isCutZero
 * @returns
 */
export const filterThousands = (
    value: string | number,
    decimal = 4,
    isCutZero?: boolean
) => {
    if (new BigNumber(value).isNaN()) return `${value}`;
    if (isCutZero)
        return new BigNumber(value)
            .decimalPlaces(decimal, BigNumber.ROUND_DOWN)
            .toFormat();
    const result = new BigNumber(filterPrecision(value, decimal)).toFormat(
        decimal,
        BigNumber.ROUND_DOWN
    );
    return result;
};

/**
 * 隐藏文本信息
 * @param value
 * @param before
 * @param after
 * @param fuzz
 * @returns
 */
export const filterHideText = (
    value: string | Address,
    before = 4,
    after = 4,
    fuzz = "****"
) => {
    if (!value || value.length <= before + after) return value;
    return `${value.slice(0, before)}${fuzz}${value.slice(-after)}`;
};

/**
 * 最大值过滤
 * @param value
 * @param max
 * @param decimal
 * @returns
 */
export const filterMaxNumber = (value: string, max = "0", decimal = 4) => {
    if (new BigNumber(value).isNaN() || /^[0-9]\d*\.$/.test(value))
        return value;
    const result = BigNumber.minimum(
        value,
        filterPrecision(max, decimal)
    ).toString();
    return result;
};

/**
 * 最小精度显示优化
 * @param value
 * @param decimal
 * @param prefix
 * @returns
 */
export const filterMinimumPrecision = (
    value: string,
    decimal = 4,
    prefix = "<"
) => {
    if (Number(value) === 0) return "0";
    const minimum = `0.${"1".padStart(decimal, "0")}`;
    const compare = new BigNumber(value).isGreaterThan(minimum);
    const result = compare
        ? filterThousands(value, decimal)
        : `${prefix}${minimum}`;
    return result;
};

/**
 * 大数缩写 -> K M B
 * @param value
 * @param decimal
 * @returns
 */
export const filterAbbreviation = (value: string, decimal = 2) => {
    const numValue = new BigNumber(value);
    if (numValue.isGreaterThanOrEqualTo(1e9)) {
        return `${filterThousands(
            numValue.dividedBy(1e9).toString(),
            decimal
        )}B`;
    }
    if (numValue.isGreaterThanOrEqualTo(1e6)) {
        return `${filterThousands(
            numValue.dividedBy(1e6).toString(),
            decimal
        )}M`;
    }
    if (numValue.isGreaterThanOrEqualTo(1e3)) {
        return `${filterThousands(
            numValue.dividedBy(1e3).toString(),
            decimal
        )}K`;
    }
    return filterThousands(value, decimal);
};

/**
 * 邮箱校验
 * @param value
 * @returns
 */
export const verifyEmail = (value: string) => {
    const regexp = /^[^@\s]+@[^@\s]+\.[^@\s]+$/g;
    // const regexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.([a-zA-Z]{2,10})$/;
    return !regexp.test(value);
};

/**
 * 密码校验
 * @param value
 * @returns
 */
export const verifyPassword = (value: string) => {
    if (value.length < 8) return true;
    if (value.length > 20) return true;
    const regexp = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/;
    // const regexp = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,20}$/;
    return !regexp.test(value);
};

/**
 * IP校验
 * @param value
 * @returns
 */
export const verifyIP = (value: string) => {
    const regexp =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // const regexp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}/;
    return !regexp.test(value);
};

/**
 * 数组元素重复校验
 * @param value
 * @param key
 * @returns
 */
export const verifyRepeat = (value: any[], key?: string) => {
    const temp = value.filter((x) => (key ? x[key] : x));
    const shake = key ? uniqBy(temp, key) : uniq(temp);
    return !(shake.length === temp.length);
};

/**
 * 非负数校验
 * @param value
 * @param decimal
 * @returns
 */
export const verifyValidNumber = (value: string, decimal = 4) => {
    const regexp =
        decimal === 0
            ? "(^(0|[1-9]\\d*)$)"
            : `(^(0|([1-9]\\d*))(\\.\\d{0,${decimal}})?$)`;
    // const regexp = new RegExp(`(^[1-9]\\d*(\\.\\d{0,${decimal}})?$)|(^0(\\.\\d{0,${decimal}})?$)`);
    return !new RegExp(regexp).test(value);
};

/**
 * 导入图片资源 -> Vite
 * @param value
 * @returns
 */
export function getImageUrl(value: string) {
    const result = value.replace("@/", "");
    return new URL(`/src/${result}`, import.meta.url).href;
}

/**
 * UUID(RFC4122) -> https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid#answer-2117523
 * @returns
 */
export const uuidv4 = () => {
    const UINT36 = "10000000-1000-4000-8000-100000000000";
    // eslint-disable-next-line no-bitwise
    const random = (x: string) =>
        ((Number(x) ^ crypto.getRandomValues(new Uint8Array(1))[0]) & 15) >>
        (Number(x) / 4);
    return UINT36.replace(/[018]/g, (x) => random(x)!.toString(16));
};

/**
 * 外链跳转
 * @param address
 * @param target
 */
export const jumpLink = (
    address: string,
    target: "_self" | "_blank" = "_self"
) => {
    if(!address?.startsWith('http')){
        return window.location.href = address
    }
    window.open(address, target);
};

/**
 * 搜索时排除正则符号
 * @param value
 * @returns
 */
export const filterSearch = (value: string) => {
    return value.replace(/([.?*+^$[\]\\(){}|-])/g, "");
};

/**
 * blob下载
 * @param fileName
 * @param content
 * @returns
 */
export const download = (fileName: string, content: Blob) => {
    if (!("download" in window.document.createElement("a"))) {
        throw new Error("Parameter is not a number!");
    }
    const blob = new Blob([content], { type: "" });
    const link = window.document.createElement("a");
    link.download = fileName;
    link.style.display = "none";
    link.href = URL.createObjectURL(blob);
    window.document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    window.document.body.removeChild(link);
    return null;
};

export const filterColor = (params: 0 | 1 | 2) => {
    if (params === 0) {
        return "up";
    }
    if (params === 1) {
        return "down";
    }
    return "initial";
};

// warning
// 判断当前输入值 如果为6位则除100，4位则直接返回，当ETH价格超过9999时失效
export const dangerouslyFormatPriceWithFourDecimals = (_i: number | string) => {
    const _input = _i.toString();
    if (_input.length === 6) {
        return BigNumber(_input).div(100).toString();
    }
    return _i.toString();
};

export const getPriceColor = (v: any) => {
    return new BigNumber(v || 0).lt(0) ? "verso" : "front";
};

export const rangeRandom = (min = 0, max = 0) => {
    // const num = Math.random() * (m - n + 1) + n;
    return Math.random() * (max - min) + min;
};

function getRandom(min: number, max: number) {
    return Math.round(Math.random() * (max - min) + min);
}

export function randomAddress() {
    let code = "";
    for (let i = 0; i < 40; i++) {
        let type = getRandom(1, 3);
        switch (type) {
            case 1:
                code += String.fromCharCode(getRandom(48, 57)); // 数字
                break;
            case 2:
                code += String.fromCharCode(getRandom(65, 90)); // 大写字母
                break;
            case 3:
                code += String.fromCharCode(getRandom(97, 122)); // 小写字母
                break;
        }
    }
    return code;
}

export const getLeverage = ({
    position,
    markPrice,
    collateral,
    pnl,
}: {
    position: string | number;
    collateral: string | number;
    markPrice: string | number;
    pnl: string | number;
}) => {
    if (!position || !markPrice || !collateral) return "-";
    return BigNumber(position)
        .multipliedBy(markPrice)
        .dividedBy(BigNumber(collateral).plus(pnl))
        .toFixed(2, BigNumber.ROUND_DOWN);
};

export const getRemainingTime = () => {
    const currentTime = dayjs();
    const minutes = currentTime.minute() + 1;

    console.log("minutes", minutes);

    let remainingTime;
    if (minutes < 30 && minutes > 0) {
        remainingTime = 30 - minutes;
    } else {
        remainingTime = 60 - minutes;
    }

    return remainingTime < 10
        ? dayjs().add(+remainingTime, "m").subtract(30, "s").unix()
        : undefined;
};

export function isJSONString(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

export const getExtensive = (
    res: any,
    option: { suffix?: any; prefix?: any }
) => {
    const finite = !BigNumber(res).isFinite();
    const result = finite
        ? "Extensive"
        : (option?.prefix || "") + res + (option?.suffix || "");
    return result;
};

/**
 * 字符串截短
 * @param str 原字符串
 * @param n 保留位数
 */
export const shortStr = (str: string, n: number) => {
    if (!str || Object.prototype.toString.call(str) !== "[object String]") {
        return "";
    }
    if (Number.isNaN(Number(n)) || Number(n) === 0) {
        return str;
    }
    if (str.length <= n) {
        return str;
    }
    const len = Math.ceil(n / 2);
    const pre = str.slice(0, n);
    const next = str.slice(str.length - len, str.length);
    return `${pre}...${next}`;
};

export const format = (str: string, decimal?: number) => {
    if (!str) return "";
    if (BigNumber(str).isZero()) return "";
    return BigNumber(str).toFixed(decimal || 6, BigNumber.ROUND_DOWN);
};



export const txAwait = async (hash: string | `0x${string}`, chain: any) => {
    if (!hash) {
      throw new Error('Invalid hash');
    }
    try {
      const txPublicClient = createPublicClient({
        chain: chain,
        transport: http(),
      });
      const transaction = await txPublicClient.waitForTransactionReceipt({
        hash: hash as `0x${string}`,
      });
      // console.log('txAwait', transaction);
      if (transaction.status !== 'success') {
        throw new Error('Transaction Failed');
      }
      return transaction;
    } catch (e) {
      throw e;
    }
  };


  export function publicClientToProvider(publicClient: PublicClient) {
    const { chain, transport } = publicClient
    const network = {
      chainId: chain?.id,
      name: chain?.name,
      ensAddress: chain?.contracts?.ensRegistry?.address,
    }
    if (transport.type === 'fallback')
      return new providers.FallbackProvider(
        (transport.transports as ReturnType<HttpTransport>[]).map(
          ({ value }) => new providers.JsonRpcProvider(value?.url, network as any),
        ),
      )
    return new providers.JsonRpcProvider(transport.url, network as any)
  }

  /** Action to convert a viem Public Client to an ethers.js Provider. */
export function getEthersProvider({ chainId }: { chainId?: number } = {}) {
    const publicClient = getPublicClient({ chainId })
    return publicClientToProvider(publicClient)
  }


  export function walletClientToSigner(walletClient: WalletClient) {
    const { account, chain, transport } = walletClient
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    }
    const provider = new providers.Web3Provider(transport, network)
    const signer = provider.getSigner(account.address)
    return signer
  }
   
  /** Action to convert a viem Wallet Client to an ethers.js Signer. */
  export async function getEthersSigner({ chainId }: { chainId?: number } = {}) {
    const walletClient = await getWalletClient({ chainId })
    if (!walletClient) return undefined
    return walletClientToSigner(walletClient)
  }