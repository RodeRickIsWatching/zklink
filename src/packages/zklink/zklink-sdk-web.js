let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedBigInt64Memory0 = null;

function getBigInt64Memory0() {
    if (cachedBigInt64Memory0 === null || cachedBigInt64Memory0.byteLength === 0) {
        cachedBigInt64Memory0 = new BigInt64Array(wasm.memory.buffer);
    }
    return cachedBigInt64Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_50(arg0, arg1) {
    wasm.__wbindgen_export_3(arg0, arg1);
}

function __wbg_adapter_53(arg0, arg1, arg2) {
    wasm.__wbindgen_export_4(arg0, arg1, addHeapObject(arg2));
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
/**
* @param {OrderMatchingBuilder} builder
* @returns {OrderMatching}
*/
export function newOrderMatching(builder) {
    _assertClass(builder, OrderMatchingBuilder);
    var ptr0 = builder.__destroy_into_raw();
    const ret = wasm.newOrderMatching(ptr0);
    return OrderMatching.__wrap(ret);
}

/**
* @param {string} amount
* @returns {string}
*/
export function closestPackableTransactionAmount(amount) {
    let deferred3_0;
    let deferred3_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(amount, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.closestPackableTransactionAmount(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr2 = r0;
        var len2 = r1;
        if (r3) {
            ptr2 = 0; len2 = 0;
            throw takeObject(r2);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export_5(deferred3_0, deferred3_1, 1);
    }
}

/**
* @param {string} fee
* @returns {string}
*/
export function closestPackableTransactionFee(fee) {
    let deferred3_0;
    let deferred3_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(fee, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.closestPackableTransactionFee(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr2 = r0;
        var len2 = r1;
        if (r3) {
            ptr2 = 0; len2 = 0;
            throw takeObject(r2);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export_5(deferred3_0, deferred3_1, 1);
    }
}

/**
* @param {ChangePubKeyBuilder} builder
* @returns {ChangePubKey}
*/
export function newChangePubkey(builder) {
    _assertClass(builder, ChangePubKeyBuilder);
    var ptr0 = builder.__destroy_into_raw();
    const ret = wasm.newChangePubkey(ptr0);
    return ChangePubKey.__wrap(ret);
}

/**
* @param {LiquidationBuilder} builder
* @returns {Liquidation}
*/
export function newLiquidation(builder) {
    _assertClass(builder, LiquidationBuilder);
    var ptr0 = builder.__destroy_into_raw();
    const ret = wasm.newLiquidation(ptr0);
    return Liquidation.__wrap(ret);
}

/**
* @param {TransferBuilder} builder
* @returns {Transfer}
*/
export function newTransfer(builder) {
    _assertClass(builder, TransferBuilder);
    var ptr0 = builder.__destroy_into_raw();
    const ret = wasm.newTransfer(ptr0);
    return Transfer.__wrap(ret);
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32Memory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
* @param {FundingBuilder} builder
* @returns {Funding}
*/
export function newFunding(builder) {
    _assertClass(builder, FundingBuilder);
    var ptr0 = builder.__destroy_into_raw();
    const ret = wasm.newFunding(ptr0);
    return Funding.__wrap(ret);
}

/**
* @param {any} provider
* @returns {JsonRpcSigner}
*/
export function newRpcSignerWithProvider(provider) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.newRpcSignerWithProvider(retptr, addHeapObject(provider));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return JsonRpcSigner.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
* @param {any} signer
* @param {string} pub_key
* @param {string} chain_id
* @returns {JsonRpcSigner}
*/
export function newRpcSignerWithSigner(signer, pub_key, chain_id) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(pub_key, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(chain_id, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        wasm.newRpcSignerWithSigner(retptr, addHeapObject(signer), ptr0, len0, ptr1, len1);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return JsonRpcSigner.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
* @param {UpdateGlobalVarBuilder} builder
* @returns {UpdateGlobalVar}
*/
export function newUpdateGlobalVar(builder) {
    _assertClass(builder, UpdateGlobalVarBuilder);
    var ptr0 = builder.__destroy_into_raw();
    const ret = wasm.newUpdateGlobalVar(ptr0);
    return UpdateGlobalVar.__wrap(ret);
}

/**
* @param {ForcedExitBuilder} builder
* @returns {ForcedExit}
*/
export function newForcedExit(builder) {
    _assertClass(builder, ForcedExitBuilder);
    var ptr0 = builder.__destroy_into_raw();
    const ret = wasm.newForcedExit(ptr0);
    return ForcedExit.__wrap(ret);
}

/**
* @param {AutoDeleveragingBuilder} builder
* @returns {AutoDeleveraging}
*/
export function newAutoDeleveraging(builder) {
    _assertClass(builder, AutoDeleveragingBuilder);
    var ptr0 = builder.__destroy_into_raw();
    const ret = wasm.newAutoDeleveraging(ptr0);
    return AutoDeleveraging.__wrap(ret);
}

/**
* @param {WithdrawBuilder} builder
* @returns {Withdraw}
*/
export function newWithdraw(builder) {
    _assertClass(builder, WithdrawBuilder);
    var ptr0 = builder.__destroy_into_raw();
    const ret = wasm.newWithdraw(ptr0);
    return Withdraw.__wrap(ret);
}

/**
* @param {ContractMatchingBuilder} builder
* @returns {ContractMatching}
*/
export function newContractMatching(builder) {
    _assertClass(builder, ContractMatchingBuilder);
    var ptr0 = builder.__destroy_into_raw();
    const ret = wasm.newContractMatching(ptr0);
    return ContractMatching.__wrap(ret);
}

/**
* @param {ContractBuilder} builder
* @returns {Contract}
*/
export function newContract(builder) {
    _assertClass(builder, ContractBuilder);
    var ptr0 = builder.__destroy_into_raw();
    const ret = wasm.newContract(ptr0);
    return Contract.__wrap(ret);
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export_6(addHeapObject(e));
    }
}
function __wbg_adapter_282(arg0, arg1, arg2, arg3) {
    wasm.__wbindgen_export_7(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
export const AccountQueryType = Object.freeze({ AccountId:0,"0":"AccountId",Address:1,"1":"Address", });
/**
*/
export const WaitForTxStatus = Object.freeze({ Success:0,"0":"Success",Failed:1,"1":"Failed",Pending:2,"2":"Pending", });
/**
*/
export const EthAuthType = Object.freeze({ OnChain:0,"0":"OnChain",EthECDSA:1,"1":"EthECDSA",EthCREATE2:2,"2":"EthCREATE2", });
/**
*/
export const BlockNumber = Object.freeze({ Latest:0,"0":"Latest",Finalized:1,"1":"Finalized",Safe:2,"2":"Safe",Earliest:3,"3":"Earliest",Pending:4,"4":"Pending",Number:5,"5":"Number", });
/**
* A set of L2 transaction type supported by the zklink network.
*/
export const ZkLinkTxType = Object.freeze({ Deposit:0,"0":"Deposit",FullExit:1,"1":"FullExit",ChangePubKey:2,"2":"ChangePubKey",Transfer:3,"3":"Transfer",Withdraw:4,"4":"Withdraw",ForcedExit:5,"5":"ForcedExit",OrderMatching:6,"6":"OrderMatching",AutoDeleveraging:7,"7":"AutoDeleveraging",ContractMatching:8,"8":"ContractMatching",Funding:9,"9":"Funding",Liquidation:10,"10":"Liquidation",UpdateGlobalVar:11,"11":"UpdateGlobalVar", });
/**
*/
export const L1SignatureType = Object.freeze({ Eth:0,"0":"Eth",Eip1271:1,"1":"Eip1271",Stark:2,"2":"Stark", });
/**
*/
export const ParameterType = Object.freeze({ FeeAccount:0,"0":"FeeAccount",InsuranceFundAccount:1,"1":"InsuranceFundAccount",MarginInfo:2,"2":"MarginInfo",FundingInfos:3,"3":"FundingInfos",ContractInfo:4,"4":"ContractInfo", });
/**
*/
export class AccountQuery {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_accountquery_free(ptr);
    }
    /**
    * @param {AccountQueryType} query_type
    * @param {string} query_param
    */
    constructor(query_type, query_param) {
        const ptr0 = passStringToWasm0(query_param, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.accountquery_new(query_type, ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}
/**
*/
export class AutoDeleveraging {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(AutoDeleveraging.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_autodeleveraging_free(ptr);
    }
    /**
    * @returns {any}
    */
    jsValue() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.autodeleveraging_jsValue(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class AutoDeleveragingBuilder {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_autodeleveragingbuilder_free(ptr);
    }
    /**
    * @param {number} account_id
    * @param {number} sub_account_id
    * @param {number} sub_account_nonce
    * @param {any[]} contract_prices
    * @param {any[]} margin_prices
    * @param {number} adl_account_id
    * @param {number} pair_id
    * @param {string} adl_size
    * @param {string} adl_price
    * @param {string} fee
    * @param {number} fee_token
    */
    constructor(account_id, sub_account_id, sub_account_nonce, contract_prices, margin_prices, adl_account_id, pair_id, adl_size, adl_price, fee, fee_token) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(contract_prices, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayJsValueToWasm0(margin_prices, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(adl_size, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(adl_price, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len3 = WASM_VECTOR_LEN;
            const ptr4 = passStringToWasm0(fee, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len4 = WASM_VECTOR_LEN;
            wasm.autodeleveragingbuilder_new(retptr, account_id, sub_account_id, sub_account_nonce, ptr0, len0, ptr1, len1, adl_account_id, pair_id, ptr2, len2, ptr3, len3, ptr4, len4, fee_token);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {AutoDeleveraging}
    */
    build() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.autodeleveragingbuilder_build(ptr);
        return AutoDeleveraging.__wrap(ret);
    }
}
/**
*/
export class ChangePubKey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ChangePubKey.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_changepubkey_free(ptr);
    }
    /**
    * @returns {any}
    */
    json_value() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.changepubkey_json_value(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} layer_one_chain_id
    * @param {string} verifying_contract
    * @returns {string}
    */
    get_change_pubkey_message(layer_one_chain_id, verifying_contract) {
        let deferred3_0;
        let deferred3_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(verifying_contract, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            wasm.changepubkey_get_change_pubkey_message(retptr, this.__wbg_ptr, layer_one_chain_id, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr2 = r0;
            var len2 = r1;
            if (r3) {
                ptr2 = 0; len2 = 0;
                throw takeObject(r2);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_5(deferred3_0, deferred3_1, 1);
        }
    }
}
/**
*/
export class ChangePubKeyBuilder {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_changepubkeybuilder_free(ptr);
    }
    /**
    * @param {number} chain_id
    * @param {number} account_id
    * @param {number} sub_account_id
    * @param {string} new_pubkey_hash
    * @param {number} fee_token
    * @param {string} fee
    * @param {number} nonce
    * @param {string | undefined} [eth_signature]
    * @param {number | undefined} [ts]
    */
    constructor(chain_id, account_id, sub_account_id, new_pubkey_hash, fee_token, fee, nonce, eth_signature, ts) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(new_pubkey_hash, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(fee, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(eth_signature) ? 0 : passStringToWasm0(eth_signature, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            var len2 = WASM_VECTOR_LEN;
            wasm.changepubkeybuilder_new(retptr, chain_id, account_id, sub_account_id, ptr0, len0, fee_token, ptr1, len1, nonce, ptr2, len2, !isLikeNone(ts), isLikeNone(ts) ? 0 : ts);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {ChangePubKey}
    */
    build() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.changepubkeybuilder_build(ptr);
        return ChangePubKey.__wrap(ret);
    }
}
/**
*/
export class Contract {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Contract.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_contract_free(ptr);
    }
    /**
    * @returns {any}
    */
    jsonValue() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.contract_jsonValue(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class ContractBuilder {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_contractbuilder_free(ptr);
    }
    /**
    * @param {number} account_id
    * @param {number} sub_account_id
    * @param {number} slot_id
    * @param {number} nonce
    * @param {number} pair_id
    * @param {string} size
    * @param {string} price
    * @param {boolean} direction
    * @param {number} maker_fee_rate
    * @param {number} taker_fee_rate
    * @param {boolean} has_subsidy
    */
    constructor(account_id, sub_account_id, slot_id, nonce, pair_id, size, price, direction, maker_fee_rate, taker_fee_rate, has_subsidy) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(size, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(price, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len1 = WASM_VECTOR_LEN;
            wasm.contractbuilder_new(retptr, account_id, sub_account_id, slot_id, nonce, pair_id, ptr0, len0, ptr1, len1, direction, maker_fee_rate, taker_fee_rate, has_subsidy);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Contract}
    */
    build() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.contractbuilder_build(ptr);
        return Contract.__wrap(ret);
    }
}
/**
*/
export class ContractInfo {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_contractinfo_free(ptr);
    }
    /**
    * @param {number} pair_id
    * @param {string} symbol
    * @param {number} initial_margin_rate
    * @param {number} maintenance_margin_rate
    */
    constructor(pair_id, symbol, initial_margin_rate, maintenance_margin_rate) {
        const ptr0 = passStringToWasm0(symbol, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.contractinfo_new(pair_id, ptr0, len0, initial_margin_rate, maintenance_margin_rate);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @returns {any}
    */
    jsonValue() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.contractinfo_jsonValue(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class ContractMatching {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ContractMatching.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_contractmatching_free(ptr);
    }
    /**
    * @returns {any}
    */
    jsValue() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.contractmatching_jsValue(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class ContractMatchingBuilder {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_contractmatchingbuilder_free(ptr);
    }
    /**
    * @param {number} account_id
    * @param {number} sub_account_id
    * @param {any} taker
    * @param {any[]} maker
    * @param {string} fee
    * @param {number} fee_token
    * @param {any[]} contract_prices
    * @param {any[]} margin_prices
    */
    constructor(account_id, sub_account_id, taker, maker, fee, fee_token, contract_prices, margin_prices) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(maker, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(fee, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArrayJsValueToWasm0(contract_prices, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passArrayJsValueToWasm0(margin_prices, wasm.__wbindgen_export_0);
            const len3 = WASM_VECTOR_LEN;
            wasm.contractmatchingbuilder_new(retptr, account_id, sub_account_id, addHeapObject(taker), ptr0, len0, ptr1, len1, fee_token, ptr2, len2, ptr3, len3);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {ContractMatching}
    */
    build() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.contractmatchingbuilder_build(ptr);
        return ContractMatching.__wrap(ret);
    }
}
/**
*/
export class ContractPrice {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_contractprice_free(ptr);
    }
    /**
    * @param {number} pair_id
    * @param {string} market_price
    */
    constructor(pair_id, market_price) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(market_price, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            wasm.contractprice_new(retptr, pair_id, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any}
    */
    jsonValue() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.contractprice_jsonValue(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class Create2Data {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_create2data_free(ptr);
    }
    /**
    * @param {string} creator_address
    * @param {string} salt
    * @param {string} code_hash
    */
    constructor(creator_address, salt, code_hash) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(creator_address, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(salt, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(code_hash, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len2 = WASM_VECTOR_LEN;
            wasm.create2data_new(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} pubkey_hash
    * @returns {string}
    */
    salt(pubkey_hash) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(pubkey_hash, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            wasm.create2data_salt(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_5(deferred2_0, deferred2_1, 1);
        }
    }
    /**
    * @returns {any}
    */
    json_value() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.create2data_json_value(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class EthTxOption {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ethtxoption_free(ptr);
    }
    /**
    * @param {boolean} is_support_eip1559
    * @param {string} to
    * @param {number | undefined} [nonce]
    * @param {string | undefined} [value]
    * @param {number | undefined} [gas]
    * @param {string | undefined} [gas_price]
    */
    constructor(is_support_eip1559, to, nonce, value, gas, gas_price) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(to, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(value) ? 0 : passStringToWasm0(value, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(gas_price) ? 0 : passStringToWasm0(gas_price, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            var len2 = WASM_VECTOR_LEN;
            wasm.ethtxoption_new(retptr, is_support_eip1559, ptr0, len0, !isLikeNone(nonce), isLikeNone(nonce) ? 0 : nonce, ptr1, len1, !isLikeNone(gas), isLikeNone(gas) ? 0 : gas, ptr2, len2);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any}
    */
    json_value() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ethtxoption_json_value(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class ForcedExit {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ForcedExit.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_forcedexit_free(ptr);
    }
    /**
    * @returns {any}
    */
    json_value() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.forcedexit_json_value(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class ForcedExitBuilder {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_forcedexitbuilder_free(ptr);
    }
    /**
    * @param {number} to_chain_id
    * @param {number} initiator_account_id
    * @param {number} initiator_sub_account_id
    * @param {number} target_sub_account_id
    * @param {string} target
    * @param {number} l2_source_token
    * @param {number} l1_target_token
    * @param {string} exit_amount
    * @param {number} initiator_nonce
    * @param {boolean} withdraw_to_l1
    * @param {number | undefined} [ts]
    */
    constructor(to_chain_id, initiator_account_id, initiator_sub_account_id, target_sub_account_id, target, l2_source_token, l1_target_token, exit_amount, initiator_nonce, withdraw_to_l1, ts) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(target, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(exit_amount, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len1 = WASM_VECTOR_LEN;
            wasm.forcedexitbuilder_new(retptr, to_chain_id, initiator_account_id, initiator_sub_account_id, target_sub_account_id, ptr0, len0, l2_source_token, l1_target_token, ptr1, len1, initiator_nonce, withdraw_to_l1, !isLikeNone(ts), isLikeNone(ts) ? 0 : ts);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {ForcedExit}
    */
    build() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.forcedexitbuilder_build(ptr);
        return ForcedExit.__wrap(ret);
    }
}
/**
*/
export class Funding {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Funding.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_funding_free(ptr);
    }
    /**
    * @returns {any}
    */
    jsValue() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.funding_jsValue(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class FundingBuilder {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_fundingbuilder_free(ptr);
    }
    /**
    * @param {number} account_id
    * @param {number} sub_account_id
    * @param {number} sub_account_nonce
    * @param {Uint32Array} funding_account_ids
    * @param {string} fee
    * @param {number} fee_token
    */
    constructor(account_id, sub_account_id, sub_account_nonce, funding_account_ids, fee, fee_token) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray32ToWasm0(funding_account_ids, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(fee, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len1 = WASM_VECTOR_LEN;
            wasm.fundingbuilder_new(retptr, account_id, sub_account_id, sub_account_nonce, ptr0, len0, ptr1, len1, fee_token);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Funding}
    */
    build() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.fundingbuilder_build(ptr);
        return Funding.__wrap(ret);
    }
}
/**
*/
export class FundingInfo {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_fundinginfo_free(ptr);
    }
    /**
    * @param {number} pair_id
    * @param {number} funding_rate
    * @param {string} price
    */
    constructor(pair_id, funding_rate, price) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(price, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            wasm.fundinginfo_new(retptr, pair_id, funding_rate, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any}
    */
    jsonValue() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.fundinginfo_jsonValue(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class JsonRpcSigner {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsonRpcSigner.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsonrpcsigner_free(ptr);
    }
    /**
    * @param {string | undefined} [signature]
    * @returns {Promise<void>}
    */
    initZklinkSigner(signature) {
        var ptr0 = isLikeNone(signature) ? 0 : passStringToWasm0(signature, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsonrpcsigner_initZklinkSigner(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @returns {string}
    */
    getPubkey() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jsonrpcsigner_getPubkey(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_5(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {string}
    */
    pubkeyHash() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jsonrpcsigner_pubkeyHash(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_5(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {string | undefined}
    */
    address() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jsonrpcsigner_address(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export_5(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    signatureSeed() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jsonrpcsigner_signatureSeed(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_5(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {ChangePubKey} tx
    * @returns {any}
    */
    signChangePubkeyWithOnchain(tx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(tx, ChangePubKey);
            var ptr0 = tx.__destroy_into_raw();
            wasm.jsonrpcsigner_signChangePubkeyWithOnchain(retptr, this.__wbg_ptr, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {ChangePubKey} tx
    * @returns {Promise<any>}
    */
    signChangePubkeyWithEthEcdsaAuth(tx) {
        _assertClass(tx, ChangePubKey);
        var ptr0 = tx.__destroy_into_raw();
        const ret = wasm.jsonrpcsigner_signChangePubkeyWithEthEcdsaAuth(this.__wbg_ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {ChangePubKey} tx
    * @param {Create2Data} create2_data
    * @returns {any}
    */
    signChangePubkeyWithCreate2DataAuth(tx, create2_data) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(tx, ChangePubKey);
            var ptr0 = tx.__destroy_into_raw();
            _assertClass(create2_data, Create2Data);
            var ptr1 = create2_data.__destroy_into_raw();
            wasm.jsonrpcsigner_signChangePubkeyWithCreate2DataAuth(retptr, this.__wbg_ptr, ptr0, ptr1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Transfer} tx
    * @param {string} token_symbol
    * @returns {Promise<any>}
    */
    signTransfer(tx, token_symbol) {
        _assertClass(tx, Transfer);
        var ptr0 = tx.__destroy_into_raw();
        const ptr1 = passStringToWasm0(token_symbol, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.jsonrpcsigner_signTransfer(this.__wbg_ptr, ptr0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * @param {Order} order
    * @returns {any}
    */
    createSignedOrder(order) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(order, Order);
            var ptr0 = order.__destroy_into_raw();
            wasm.jsonrpcsigner_createSignedOrder(retptr, this.__wbg_ptr, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {OrderMatching} tx
    * @returns {any}
    */
    signOrderMatching(tx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(tx, OrderMatching);
            var ptr0 = tx.__destroy_into_raw();
            wasm.jsonrpcsigner_signOrderMatching(retptr, this.__wbg_ptr, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Withdraw} tx
    * @param {string} token_symbol
    * @returns {Promise<any>}
    */
    signWithdraw(tx, token_symbol) {
        _assertClass(tx, Withdraw);
        var ptr0 = tx.__destroy_into_raw();
        const ptr1 = passStringToWasm0(token_symbol, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.jsonrpcsigner_signWithdraw(this.__wbg_ptr, ptr0, ptr1, len1);
        return takeObject(ret);
    }
    /**
    * @param {ForcedExit} tx
    * @returns {any}
    */
    signForcedExit(tx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(tx, ForcedExit);
            var ptr0 = tx.__destroy_into_raw();
            wasm.jsonrpcsigner_signForcedExit(retptr, this.__wbg_ptr, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {AutoDeleveraging} tx
    * @returns {any}
    */
    signAutoDeleveraging(tx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(tx, AutoDeleveraging);
            var ptr0 = tx.__destroy_into_raw();
            wasm.jsonrpcsigner_signAutoDeleveraging(retptr, this.__wbg_ptr, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Contract} contract
    * @returns {any}
    */
    createSignedContract(contract) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(contract, Contract);
            var ptr0 = contract.__destroy_into_raw();
            wasm.jsonrpcsigner_createSignedContract(retptr, this.__wbg_ptr, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {ContractMatching} tx
    * @returns {any}
    */
    signContractMatching(tx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(tx, ContractMatching);
            var ptr0 = tx.__destroy_into_raw();
            wasm.jsonrpcsigner_signContractMatching(retptr, this.__wbg_ptr, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Funding} tx
    * @returns {any}
    */
    signFunding(tx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(tx, Funding);
            var ptr0 = tx.__destroy_into_raw();
            wasm.jsonrpcsigner_signFunding(retptr, this.__wbg_ptr, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Liquidation} tx
    * @returns {any}
    */
    signLiquidation(tx) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(tx, Liquidation);
            var ptr0 = tx.__destroy_into_raw();
            wasm.jsonrpcsigner_signLiquidation(retptr, this.__wbg_ptr, ptr0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class Liquidation {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Liquidation.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_liquidation_free(ptr);
    }
    /**
    * @returns {any}
    */
    jsValue() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.liquidation_jsValue(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class LiquidationBuilder {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_liquidationbuilder_free(ptr);
    }
    /**
    * @param {number} account_id
    * @param {number} sub_account_id
    * @param {number} sub_account_nonce
    * @param {any[]} contract_prices
    * @param {any[]} margin_prices
    * @param {number} liquidation_account_id
    * @param {string} fee
    * @param {number} fee_token
    */
    constructor(account_id, sub_account_id, sub_account_nonce, contract_prices, margin_prices, liquidation_account_id, fee, fee_token) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(contract_prices, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayJsValueToWasm0(margin_prices, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(fee, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len2 = WASM_VECTOR_LEN;
            wasm.liquidationbuilder_new(retptr, account_id, sub_account_id, sub_account_nonce, ptr0, len0, ptr1, len1, liquidation_account_id, ptr2, len2, fee_token);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Liquidation}
    */
    build() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.liquidationbuilder_build(ptr);
        return Liquidation.__wrap(ret);
    }
}
/**
*/
export class MarginInfo {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_margininfo_free(ptr);
    }
    /**
    * @param {number} margin_id
    * @param {number} token_id
    * @param {number} ratio
    */
    constructor(margin_id, token_id, ratio) {
        const ret = wasm.margininfo_new(margin_id, token_id, ratio);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @returns {any}
    */
    jsonValue() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.margininfo_jsonValue(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class Order {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_order_free(ptr);
    }
    /**
    * @param {number} account_id
    * @param {number} sub_account_id
    * @param {number} slot_id
    * @param {number} nonce
    * @param {number} base_token_id
    * @param {number} quote_token_id
    * @param {string} amount
    * @param {string} price
    * @param {boolean} is_sell
    * @param {number} maker_fee_rate
    * @param {number} taker_fee_rate
    * @param {boolean} has_subsidy
    */
    constructor(account_id, sub_account_id, slot_id, nonce, base_token_id, quote_token_id, amount, price, is_sell, maker_fee_rate, taker_fee_rate, has_subsidy) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(amount, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(price, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len1 = WASM_VECTOR_LEN;
            wasm.order_new(retptr, account_id, sub_account_id, slot_id, nonce, base_token_id, quote_token_id, ptr0, len0, ptr1, len1, is_sell, maker_fee_rate, taker_fee_rate, has_subsidy);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any}
    */
    json_value() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.order_json_value(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class OrderMatching {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(OrderMatching.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ordermatching_free(ptr);
    }
    /**
    * @returns {any}
    */
    json_value() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ordermatching_json_value(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class OrderMatchingBuilder {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ordermatchingbuilder_free(ptr);
    }
    /**
    * @param {number} account_id
    * @param {number} sub_account_id
    * @param {any} taker
    * @param {any} maker
    * @param {string} fee
    * @param {number} fee_token
    * @param {any[]} contract_prices
    * @param {any[]} margin_prices
    * @param {string} expect_base_amount
    * @param {string} expect_quote_amount
    */
    constructor(account_id, sub_account_id, taker, maker, fee, fee_token, contract_prices, margin_prices, expect_base_amount, expect_quote_amount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(fee, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayJsValueToWasm0(contract_prices, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArrayJsValueToWasm0(margin_prices, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(expect_base_amount, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len3 = WASM_VECTOR_LEN;
            const ptr4 = passStringToWasm0(expect_quote_amount, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len4 = WASM_VECTOR_LEN;
            wasm.ordermatchingbuilder_new(retptr, account_id, sub_account_id, addHeapObject(taker), addHeapObject(maker), ptr0, len0, fee_token, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {OrderMatching}
    */
    build() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.ordermatchingbuilder_build(ptr);
        return OrderMatching.__wrap(ret);
    }
}
/**
*/
export class Parameter {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_parameter_free(ptr);
    }
    /**
    * @param {ParameterType} parameter_type
    * @param {any} parameter_value
    */
    constructor(parameter_type, parameter_value) {
        const ret = wasm.parameter_new(parameter_type, addHeapObject(parameter_value));
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}
/**
*/
export class RequestArguments {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_requestarguments_free(ptr);
    }
}
/**
*/
export class RpcClient {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rpcclient_free(ptr);
    }
    /**
    * @param {string} network
    * @param {string | undefined} [custom_url]
    */
    constructor(network, custom_url) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(network, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(custom_url) ? 0 : passStringToWasm0(custom_url, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            var len1 = WASM_VECTOR_LEN;
            wasm.rpcclient_new(retptr, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Promise<any>}
    */
    getSupportTokens() {
        const ret = wasm.rpcclient_getSupportTokens(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {AccountQuery} account_query
    * @param {number | undefined} [sub_account_id]
    * @param {number | undefined} [block_number]
    * @returns {Promise<any>}
    */
    getAccountSnapshot(account_query, sub_account_id, block_number) {
        _assertClass(account_query, AccountQuery);
        var ptr0 = account_query.__destroy_into_raw();
        const ret = wasm.rpcclient_getAccountSnapshot(this.__wbg_ptr, ptr0, isLikeNone(sub_account_id) ? 0xFFFFFF : sub_account_id, !isLikeNone(block_number), isLikeNone(block_number) ? 0 : block_number);
        return takeObject(ret);
    }
    /**
    * @param {any} tx
    * @param {TxLayer1Signature | undefined} [l1_signature]
    * @param {TxZkLinkSignature | undefined} [l2_signature]
    * @returns {Promise<any>}
    */
    sendTransaction(tx, l1_signature, l2_signature) {
        let ptr0 = 0;
        if (!isLikeNone(l1_signature)) {
            _assertClass(l1_signature, TxLayer1Signature);
            ptr0 = l1_signature.__destroy_into_raw();
        }
        let ptr1 = 0;
        if (!isLikeNone(l2_signature)) {
            _assertClass(l2_signature, TxZkLinkSignature);
            ptr1 = l2_signature.__destroy_into_raw();
        }
        const ret = wasm.rpcclient_sendTransaction(this.__wbg_ptr, addHeapObject(tx), ptr0, ptr1);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    getSupportChains() {
        const ret = wasm.rpcclient_getSupportChains(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    getLatestBlockNumber() {
        const ret = wasm.rpcclient_getLatestBlockNumber(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {number | undefined} block_number
    * @param {boolean} include_tx
    * @param {boolean} include_update
    * @returns {Promise<any>}
    */
    getBlockByNumber(block_number, include_tx, include_update) {
        const ret = wasm.rpcclient_getBlockByNumber(this.__wbg_ptr, !isLikeNone(block_number), isLikeNone(block_number) ? 0 : block_number, include_tx, include_update);
        return takeObject(ret);
    }
    /**
    * @param {bigint} last_tx_timestamp_micro
    * @param {boolean} include_tx
    * @param {boolean} include_update
    * @param {number | undefined} [limit]
    * @returns {Promise<any>}
    */
    getPendingBlock(last_tx_timestamp_micro, include_tx, include_update, limit) {
        const ret = wasm.rpcclient_getPendingBlock(this.__wbg_ptr, last_tx_timestamp_micro, include_tx, include_update, !isLikeNone(limit), isLikeNone(limit) ? 0 : limit);
        return takeObject(ret);
    }
    /**
    * @param {number} block_number
    * @returns {Promise<any>}
    */
    getBlockOnChainByNumber(block_number) {
        const ret = wasm.rpcclient_getBlockOnChainByNumber(this.__wbg_ptr, block_number);
        return takeObject(ret);
    }
    /**
    * @param {AccountQuery} account_query
    * @returns {Promise<any>}
    */
    getAccount(account_query) {
        _assertClass(account_query, AccountQuery);
        var ptr0 = account_query.__destroy_into_raw();
        const ret = wasm.rpcclient_getAccount(this.__wbg_ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {number} account_id
    * @param {number | undefined} [sub_account_id]
    * @returns {Promise<any>}
    */
    getAccountBalances(account_id, sub_account_id) {
        const ret = wasm.rpcclient_getAccountBalances(this.__wbg_ptr, account_id, isLikeNone(sub_account_id) ? 0xFFFFFF : sub_account_id);
        return takeObject(ret);
    }
    /**
    * @param {number} account_id
    * @param {number | undefined} [sub_account_id]
    * @returns {Promise<any>}
    */
    getAccountOrderSlots(account_id, sub_account_id) {
        const ret = wasm.rpcclient_getAccountOrderSlots(this.__wbg_ptr, account_id, isLikeNone(sub_account_id) ? 0xFFFFFF : sub_account_id);
        return takeObject(ret);
    }
    /**
    * @param {number} token_id
    * @param {boolean} mapping
    * @returns {Promise<any>}
    */
    getTokenReserve(token_id, mapping) {
        const ret = wasm.rpcclient_getTokenReserve(this.__wbg_ptr, token_id, mapping);
        return takeObject(ret);
    }
    /**
    * @param {string} hash
    * @param {boolean} include_update
    * @returns {Promise<any>}
    */
    getTransactionByHash(hash, include_update) {
        const ptr0 = passStringToWasm0(hash, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rpcclient_getTransactionByHash(this.__wbg_ptr, ptr0, len0, include_update);
        return takeObject(ret);
    }
    /**
    * @param {ZkLinkTxType} tx_type
    * @param {string} address
    * @param {bigint} page_index
    * @param {number} page_size
    * @returns {Promise<any>}
    */
    getAccountTransactionHistory(tx_type, address, page_index, page_size) {
        const ptr0 = passStringToWasm0(address, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rpcclient_getAccountTransactionHistory(this.__wbg_ptr, tx_type, ptr0, len0, page_index, page_size);
        return takeObject(ret);
    }
    /**
    * @param {bigint} last_tx_timestamp
    * @param {number} max_txs
    * @returns {Promise<any>}
    */
    getWithdrawTxs(last_tx_timestamp, max_txs) {
        const ret = wasm.rpcclient_getWithdrawTxs(this.__wbg_ptr, last_tx_timestamp, max_txs);
        return takeObject(ret);
    }
    /**
    * @param {number} sub_account_id
    * @param {bigint} offset_id
    * @param {bigint} limit
    * @returns {Promise<any>}
    */
    pullForwardTxs(sub_account_id, offset_id, limit) {
        const ret = wasm.rpcclient_pullForwardTxs(this.__wbg_ptr, sub_account_id, offset_id, limit);
        return takeObject(ret);
    }
    /**
    * @param {string} topic
    * @param {number} from_topic_index_included
    * @param {number | undefined} [limit]
    * @returns {Promise<any>}
    */
    getWebSocketEvents(topic, from_topic_index_included, limit) {
        const ptr0 = passStringToWasm0(topic, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rpcclient_getWebSocketEvents(this.__wbg_ptr, ptr0, len0, from_topic_index_included, !isLikeNone(limit), isLikeNone(limit) ? 0 : limit);
        return takeObject(ret);
    }
}
/**
*/
export class SpotPriceInfo {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_spotpriceinfo_free(ptr);
    }
    /**
    * @param {number} token_id
    * @param {string} price
    */
    constructor(token_id, price) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(price, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            wasm.spotpriceinfo_new(retptr, token_id, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any}
    */
    jsonValue() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.spotpriceinfo_jsonValue(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class Transfer {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Transfer.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transfer_free(ptr);
    }
    /**
    * @returns {any}
    */
    json_value() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transfer_json_value(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class TransferBuilder {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transferbuilder_free(ptr);
    }
    /**
    * @param {number} account_id
    * @param {string} to_address
    * @param {number} from_sub_account_id
    * @param {number} to_sub_account_id
    * @param {number} token
    * @param {string} fee
    * @param {string} amount
    * @param {number} nonce
    * @param {number | undefined} [ts]
    */
    constructor(account_id, to_address, from_sub_account_id, to_sub_account_id, token, fee, amount, nonce, ts) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(to_address, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(fee, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(amount, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len2 = WASM_VECTOR_LEN;
            wasm.transferbuilder_new(retptr, account_id, ptr0, len0, from_sub_account_id, to_sub_account_id, token, ptr1, len1, ptr2, len2, nonce, !isLikeNone(ts), isLikeNone(ts) ? 0 : ts);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Transfer}
    */
    build() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.transferbuilder_build(ptr);
        return Transfer.__wrap(ret);
    }
}
/**
*/
export class TxLayer1Signature {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_txlayer1signature_free(ptr);
    }
    /**
    * @param {L1SignatureType} sign_type
    * @param {string} signature
    */
    constructor(sign_type, signature) {
        const ptr0 = passStringToWasm0(signature, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.txlayer1signature_new(sign_type, ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @returns {L1SignatureType}
    */
    signType() {
        const ret = wasm.txlayer1signature_signType(this.__wbg_ptr);
        return ret;
    }
    /**
    * @returns {string}
    */
    signature() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.txlayer1signature_signature(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_5(deferred1_0, deferred1_1, 1);
        }
    }
}
/**
*/
export class TxZkLinkSignature {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_txzklinksignature_free(ptr);
    }
    /**
    * @param {string} pub_key
    * @param {string} signature
    */
    constructor(pub_key, signature) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(pub_key, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(signature, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len1 = WASM_VECTOR_LEN;
            wasm.txzklinksignature_new(retptr, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    pubKey() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.txzklinksignature_pubKey(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_5(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {string}
    */
    signature() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.txzklinksignature_signature(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_5(deferred1_0, deferred1_1, 1);
        }
    }
}
/**
*/
export class UpdateGlobalVar {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(UpdateGlobalVar.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_updateglobalvar_free(ptr);
    }
    /**
    * @returns {any}
    */
    jsonValue() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.updateglobalvar_jsonValue(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any}
    */
    zklinkTx() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.updateglobalvar_zklinkTx(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class UpdateGlobalVarBuilder {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_updateglobalvarbuilder_free(ptr);
    }
    /**
    * @param {number} from_chain_id
    * @param {number} sub_account_id
    * @param {Parameter} parameter
    * @param {number} serial_id
    */
    constructor(from_chain_id, sub_account_id, parameter, serial_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(parameter, Parameter);
            var ptr0 = parameter.__destroy_into_raw();
            wasm.updateglobalvarbuilder_new(retptr, from_chain_id, sub_account_id, ptr0, serial_id);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {UpdateGlobalVar}
    */
    build() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.updateglobalvarbuilder_build(ptr);
        return UpdateGlobalVar.__wrap(ret);
    }
}
/**
*/
export class Wallet {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wallet_free(ptr);
    }
    /**
    * @param {string} url
    * @param {string} private_key
    */
    constructor(url, private_key) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(url, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(private_key, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len1 = WASM_VECTOR_LEN;
            wasm.wallet_new(retptr, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Promise<string>}
    */
    getBalance() {
        const ret = wasm.wallet_getBalance(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {BlockNumber} block_number
    * @param {number | undefined} [block]
    * @returns {Promise<number>}
    */
    getNonce(block_number, block) {
        const ret = wasm.wallet_getNonce(this.__wbg_ptr, block_number, !isLikeNone(block), isLikeNone(block) ? 0 : block);
        return takeObject(ret);
    }
    /**
    * @param {EthTxOption} eth_params
    * @returns {Promise<string>}
    */
    getDepositFee(eth_params) {
        _assertClass(eth_params, EthTxOption);
        var ptr0 = eth_params.__destroy_into_raw();
        const ret = wasm.wallet_getDepositFee(this.__wbg_ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {string} tx_hash
    * @param {number | undefined} [timeout]
    * @returns {Promise<WaitForTxStatus>}
    */
    waitForTransaction(tx_hash, timeout) {
        const ptr0 = passStringToWasm0(tx_hash, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wallet_waitForTransaction(this.__wbg_ptr, ptr0, len0, !isLikeNone(timeout), isLikeNone(timeout) ? 0 : timeout);
        return takeObject(ret);
    }
    /**
    * @param {string} contract
    * @param {string} amount
    * @param {EthTxOption} eth_params
    * @returns {Promise<string>}
    */
    approveERC20(contract, amount, eth_params) {
        const ptr0 = passStringToWasm0(contract, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(amount, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        _assertClass(eth_params, EthTxOption);
        var ptr2 = eth_params.__destroy_into_raw();
        const ret = wasm.wallet_approveERC20(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2);
        return takeObject(ret);
    }
    /**
    * @param {number} sub_account_id
    * @param {string} deposit_to
    * @param {string} token_addr
    * @param {string} amount
    * @param {boolean} mapping
    * @param {EthTxOption} eth_params
    * @param {boolean} is_gateway
    * @returns {Promise<string>}
    */
    depositERC20(sub_account_id, deposit_to, token_addr, amount, mapping, eth_params, is_gateway) {
        const ptr0 = passStringToWasm0(deposit_to, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(token_addr, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(amount, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len2 = WASM_VECTOR_LEN;
        _assertClass(eth_params, EthTxOption);
        var ptr3 = eth_params.__destroy_into_raw();
        const ret = wasm.wallet_depositERC20(this.__wbg_ptr, sub_account_id, ptr0, len0, ptr1, len1, ptr2, len2, mapping, ptr3, is_gateway);
        return takeObject(ret);
    }
    /**
    * @param {number} sub_account_id
    * @param {string} deposit_to
    * @param {EthTxOption} eth_params
    * @param {boolean} is_gateway
    * @returns {Promise<string>}
    */
    depositETH(sub_account_id, deposit_to, eth_params, is_gateway) {
        const ptr0 = passStringToWasm0(deposit_to, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(eth_params, EthTxOption);
        var ptr1 = eth_params.__destroy_into_raw();
        const ret = wasm.wallet_depositETH(this.__wbg_ptr, sub_account_id, ptr0, len0, ptr1, is_gateway);
        return takeObject(ret);
    }
    /**
    * @param {number} nonce
    * @param {string} new_pubkey_hash
    * @param {EthTxOption} eth_params
    * @returns {Promise<string>}
    */
    setAuthPubkeyHash(nonce, new_pubkey_hash, eth_params) {
        const ptr0 = passStringToWasm0(new_pubkey_hash, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(eth_params, EthTxOption);
        var ptr1 = eth_params.__destroy_into_raw();
        const ret = wasm.wallet_setAuthPubkeyHash(this.__wbg_ptr, nonce, ptr0, len0, ptr1);
        return takeObject(ret);
    }
    /**
    * @param {number} account_id
    * @param {number} sub_account_id
    * @param {number} token_id
    * @param {boolean} mapping
    * @param {EthTxOption} eth_params
    * @returns {Promise<string>}
    */
    fullExit(account_id, sub_account_id, token_id, mapping, eth_params) {
        _assertClass(eth_params, EthTxOption);
        var ptr0 = eth_params.__destroy_into_raw();
        const ret = wasm.wallet_fullExit(this.__wbg_ptr, account_id, sub_account_id, token_id, mapping, ptr0);
        return takeObject(ret);
    }
}
/**
*/
export class Withdraw {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Withdraw.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_withdraw_free(ptr);
    }
    /**
    * @returns {any}
    */
    json_value() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.withdraw_json_value(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class WithdrawBuilder {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_withdrawbuilder_free(ptr);
    }
    /**
    * @param {number} account_id
    * @param {number} sub_account_id
    * @param {number} to_chain_id
    * @param {string} to_address
    * @param {number} l2_source_token
    * @param {number} l1_target_token
    * @param {string} amount
    * @param {string | undefined} call_data
    * @param {string} fee
    * @param {number} nonce
    * @param {boolean} withdraw_to_l1
    * @param {number} withdraw_fee_ratio
    * @param {number | undefined} [ts]
    */
    constructor(account_id, sub_account_id, to_chain_id, to_address, l2_source_token, l1_target_token, amount, call_data, fee, nonce, withdraw_to_l1, withdraw_fee_ratio, ts) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(to_address, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(amount, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(call_data) ? 0 : passStringToWasm0(call_data, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            var len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(fee, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len3 = WASM_VECTOR_LEN;
            wasm.withdrawbuilder_new(retptr, account_id, sub_account_id, to_chain_id, ptr0, len0, l2_source_token, l1_target_token, ptr1, len1, ptr2, len2, ptr3, len3, nonce, withdraw_to_l1, withdraw_fee_ratio, !isLikeNone(ts), isLikeNone(ts) ? 0 : ts);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Withdraw}
    */
    build() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.withdrawbuilder_build(ptr);
        return Withdraw.__wrap(ret);
    }
}
/**
*/
export class ZkLinkTx {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_zklinktx_free(ptr);
    }
    /**
    * @param {number} tx_type
    * @param {any} tx
    */
    constructor(tx_type, tx) {
        const ret = wasm.zklinktx_new(tx_type, addHeapObject(tx));
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_request_aa80f2dd90291bcc = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).request(takeObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_signMessage_31620e519ceecf94 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).signMessage(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_in = function(arg0, arg1) {
        const ret = getObject(arg0) in getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_is_bigint = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'bigint';
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_i64 = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
        const ret = getObject(arg0) === getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {
        const ret = BigInt.asUintN(64, arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_as_number = function(arg0) {
        const ret = +getObject(arg0);
        return ret;
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_performance_eeefc685c9bc38b4 = function(arg0) {
        const ret = getObject(arg0).performance;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_e0d8ec93dd25766a = function(arg0) {
        const ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_address_b7ff4a10022d02d8 = function(arg0, arg1) {
        const ret = getObject(arg1).address;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_selectedAddress_e88960714bb47d11 = function(arg0, arg1) {
        const ret = getObject(arg1).selectedAddress;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
        const ret = getObject(arg0) == getObject(arg1);
        return ret;
    };
    imports.wbg.__wbg_String_389b54bd9d25375f = function(arg0, arg1) {
        const ret = String(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_getwithrefkey_4a92a5eca60879b9 = function(arg0, arg1) {
        const ret = getObject(arg0)[getObject(arg1)];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_9182712abebf82ef = function(arg0, arg1, arg2) {
        getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbg_clearTimeout_76877dbc010e786d = function(arg0) {
        const ret = clearTimeout(takeObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setTimeout_75cb9b6991a4031d = function() { return handleError(function (arg0, arg1) {
        const ret = setTimeout(getObject(arg0), arg1);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_fetch_6a2624d7f767e331 = function(arg0) {
        const ret = fetch(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_fetch_693453ca3f88c055 = function(arg0, arg1) {
        const ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Response_4c3b1446206114d1 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Response;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_url_83a6a4f65f7a2b38 = function(arg0, arg1) {
        const ret = getObject(arg1).url;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_status_d6d47ad2837621eb = function(arg0) {
        const ret = getObject(arg0).status;
        return ret;
    };
    imports.wbg.__wbg_headers_24def508a7518df9 = function(arg0) {
        const ret = getObject(arg0).headers;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_arrayBuffer_5b2688e3dd873fed = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).arrayBuffer();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_signal_3c701f5f40a5f08d = function(arg0) {
        const ret = getObject(arg0).signal;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_0ae46f44b7485bb2 = function() { return handleError(function () {
        const ret = new AbortController();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_abort_2c4fb490d878d2b2 = function(arg0) {
        getObject(arg0).abort();
    };
    imports.wbg.__wbg_new_7a20246daa6eec7e = function() { return handleError(function () {
        const ret = new Headers();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_append_aa3f462f9e2b5ff2 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_newwithstrandinit_f581dff0d19a8b03 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_queueMicrotask_4d890031a6a5a50c = function(arg0) {
        queueMicrotask(getObject(arg0));
    };
    imports.wbg.__wbg_queueMicrotask_adae4bc085237231 = function(arg0) {
        const ret = getObject(arg0).queueMicrotask;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg_crypto_58f13aa23ffcb166 = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_process_5b786e71d465a513 = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_c2ab80650590b6a2 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_523d7bd03ef69fba = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg_require_2784e593a4674877 = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_msCrypto_abcb1295e768d1f2 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_a0d98aa11c81fe89 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_504510b5564925af = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_get_f01601b5a68d10e3 = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_1009b1af0c481d7b = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new_ffc6d4d085022169 = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newnoargs_c62ea9419c21fbac = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_bfd4534b584a9593 = function() {
        const ret = new Map();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_9b877f231f476d01 = function(arg0) {
        const ret = getObject(arg0).next;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_6529ee0cca8d57ed = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_done_5fe336b092d60cf2 = function(arg0) {
        const ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_value_0c248a78fdc8e19f = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_iterator_db7ca081358d4fb2 = function() {
        const ret = Symbol.iterator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_7b48513de5dc5ea4 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_90c26b09837aba1c = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_9fb8d994e1c0aaac = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_f0e34d89f33b99fd = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_d3b084224f4774d7 = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_9caa27ff917c6860 = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_35dfdd59a4da3e74 = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_f2740edb12e318cd = function(arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    };
    imports.wbg.__wbg_isArray_74fb723e24f76012 = function(arg0) {
        const ret = Array.isArray(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_e7d53d51371448e2 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_call_5da1969d7cd31ccd = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_d257c6f2da008627 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_isSafeInteger_f93fde0dca9820f8 = function(arg0) {
        const ret = Number.isSafeInteger(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_entries_9e2e2aa45aa5094a = function(arg0) {
        const ret = Object.entries(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_60f57089c7563e81 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_282(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_resolve_6e1c6553a82f85b7 = function(arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_3ab08cd4fbb91ae9 = function(arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_8371cc12cfedc5a2 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_a448f833075b71ba = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_d0482f893617af71 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_8f67e318f15d7254 = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_2357bf09366ee480 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_1d25fa9e4ac21ce7 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_bced6f43aed8c1aa = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_newwithlength_6c2df9e2f3028c43 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_subarray_2e940e41c0f5a1d9 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stringify_e1b19966d964d242 = function() { return handleError(function (arg0) {
        const ret = JSON.stringify(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_has_9c711aafa4b444a2 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.has(getObject(arg0), getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_759f75cd92b612d2 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbindgen_bigint_get_as_i64 = function(arg0, arg1) {
        const v = getObject(arg1);
        const ret = typeof(v) === 'bigint' ? v : undefined;
        getBigInt64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? BigInt(0) : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3967 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 645, __wbg_adapter_50);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper7559 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1615, __wbg_adapter_53);
        return addHeapObject(ret);
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedBigInt64Memory0 = null;
    cachedFloat64Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint32Memory0 = null;
    cachedUint8Memory0 = null;


    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('zklink-sdk-web_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;
