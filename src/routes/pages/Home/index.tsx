import { useEthersProvider, useEthersSigner } from "@/hooks/useEtherSginer";
import { RpcClient, newEthereumRpcSigner } from "@/packages/zklink/zklink-sdk-web";
import { initSdk } from "@/utils";
import { useRef, useState } from "react";
import { recoverMessageAddress } from "viem";
import { useAccount, useSignMessage } from "wagmi";

function parseInput(inputStr?: string) {
  if (!inputStr) return;
  try {
    const parsedData = JSON.parse(inputStr);
    switch (inputStr[0]) {
      case '[':
        if (Array.isArray(parsedData)) {
          return parsedData
        } else {
          throw new Error('Parsed data is not an array.');
        }
      case '{':
        if (typeof parsedData === 'object' && parsedData !== null) {
          return parsedData
        } else {
          throw new Error('Parsed data is not a valid object.');
        }
      default:
        return inputStr
    }
  } catch (e: any) {
    throw new Error(e)
  }
}

const Wrapper = ({ textareaClassName, className, onClick, value, content, disabled }: any) => {
  return (<div className={`flex flex-col gap-2 w-[220px] ${className}`}>
    <button disabled={disabled} className="btn" onClick={onClick}>
      {content}
    </button>
    {value === undefined ? null : <textarea className={`textarea textarea-bordered ${textareaClassName}`} value={value} />}
  </div>
  )
}

const WrapperWithInput = ({ editable, inputClassName, className, onClick, value, content, disabled }: any) => {
  return (<div className={`flex flex-col gap-2 w-[220px] ${className}`}>
    <button disabled={disabled} className="btn" onClick={onClick}>
      {content}
    </button>
    {(disabled || !editable) ? null : <input type="text" className={`input input-bordered w-full max-w-xs ${inputClassName}`} value={value} />}
  </div>
  )
}

const test_msg = 'zkink demo test message'

// https://docs.zk.link/developer/json-rpc-and-websocket/json-rpc-api#json-rpc-methods
const rpcMethods = ['getSupportChains', 'getSupportTokens', 'getLatestBlockNumber', 'getBlockByNumber']

export default function Home() {
  const sdk = useRef<any>()
  const account = useAccount()
  const provider = useEthersProvider()
  const signer = useEthersSigner()


  const [signerInfo, setSignerInfo] = useState<any>({})

  const updateSignerInfo = (obj) => {
    setSignerInfo(old => ({ ...old, ...obj }))
  }

  const { signMessageAsync } = useSignMessage();

  const handlePersonalSignAsync = async (msg: string) => {
    return signMessageAsync({ message: msg });
  };

  const handleInitSDK = async () => {
    const rpcUrl = account?.chain?.rpcUrls?.default?.http?.[0]
    if (!rpcUrl) return;
    const _sdk = await initSdk()
    sdk.current = _sdk;
  }

  const [_signer, setSigner] = useState<any>()
  const handleNewEthereumRpcSigner = () => {
    const rpcSigner = newEthereumRpcSigner(signer)
    console.log('rpcSigner', rpcSigner)
    setSigner(rpcSigner)
  }

  const handleSignerGetPubKey = () => {
    if (!_signer) return;
    const res = _signer.getPubkey()
    updateSignerInfo({ pubKey: res })
  }

  const handlePubkeyHash = () => {
    if (!_signer) return;
    const res = _signer.pubkeyHash()
    updateSignerInfo({ pubKeyHash: res })
  }

  const handleSignerInitZklinkSigner = async () => {
    if (!_signer) return;
    const signature = await handlePersonalSignAsync(test_msg)
    updateSignerInfo({ l1signature: signature })
    const res = await _signer.initZklinkSigner(signature)
    console.log('res', res)
  }

  const handleVerifySignature = async () => {
    const signature = signerInfo.l1signature
    const address = await recoverMessageAddress({
      message: test_msg,
      signature,
    })

    updateSignerInfo({ recoverAddress: address })
  }

  const handleOnboarding = () => { }

  const handleOnboardingInOnce = async () => {
    await handleSignerInitZklinkSigner()
    handleSignerGetPubKey()
    handlePubkeyHash()
    handleOnboarding()
  }

  const handleInitInOnce = async () => {
    await handleInitSDK()
    handleNewEthereumRpcSigner()
  }

  const handleChangePubKey = () => {
    const ts = Math.floor(Date.now() / 1000);

    // chain_id: number, account_id: number, sub_account_id: number, new_pubkey_hash: string, fee_token: number, fee: string, nonce: number, eth_signature?: string, ts?: number
    // const tx_builder = new ChangePubKeyBuilder(chainId, accountId, subAccountId, new_pubkey_hash, feeToken, Fee, nonce, eth_signature, ts);
    // const tx = newChangePubkey(tx_builder);

    // console.log('tx', tx_builder, tx)
  }

  const rpcClient = useRef<any>()
  const [rpcResult, setRpcResult] = useState({})
  const [_rpcClient, setRpcClient] = useState<any>()

  const [customMethod, setCustomMethod] = useState()
  const [customParam, setCustomParam] = useState()
  const handleCustomMethod = (e) => {
    setCustomMethod(e.target.value)
  }
  const handleCustomParam = (e) => {
    const res = e.target.value
    setCustomParam(res)
  }
  const handleSubmit = () => {
    if (!customMethod || !rpcClient.current?.[customMethod]) return;
    console.log('parseInput(customParam)', parseInput(customParam))
    rpcCalls(customMethod, parseInput(customParam))
  }

  const initRpcClient = () => {
    const rpc_client = new RpcClient("testnet");
    rpcClient.current = rpc_client
    setRpcClient(rpc_client)
  }
  const rpcCalls = async (method: string, params: any) => {
    console.log('rpcClient.current', rpcClient.current, params)
    let res;
    if (params?.length) {
      res = await rpcClient.current?.[method](...params)
    } else {
      res = await rpcClient.current?.[method]()
    }

    console.log('res', res)
    setRpcResult(res ? JSON.parse(res) : undefined)
  }

  return (
    <div className="flex flex-col gap-[24px]  px-[120px]">
      {/* rpcs */}
      <div className="flex gap-[48px] items-start justify-center">
        <div className="flex flex-col gap-[12px]">

          <div className="flex flex-row gap-[12px]">
            <div className="flex-1 flex flex-col gap-[12px]">
              <Wrapper onClick={handleInitSDK} value={undefined} content="Init SDK"></Wrapper>
              <Wrapper onClick={initRpcClient} value={undefined} content={'Init Rpc Client'}></Wrapper>
            </div>

            <div className="flex gap-[12px] items-start justify-start flex-wrap">
              {
                rpcMethods.map(i => {
                  return (<WrapperWithInput editable={false} disabled={!_rpcClient} key={i} onClick={() => rpcCalls(i)} value={undefined} content={i} />)
                })
              }
            </div>
          </div>
          <div className="w-full h-[1px] bg-[#ffffff3d]" />
          <div className="flex flex-col gap-[6px]">

            <input type="text" placeholder="custom methods" className={`input input-bordered w-full`} onChange={handleCustomMethod} value={customMethod} />
            <textarea placeholder="[param1,param2,...]" className="textarea textarea-bordered" onChange={handleCustomParam} value={customParam} />
            <button className="btn" onClick={handleSubmit}>Submit</button>

          </div>
        </div>
        <Wrapper textareaClassName="min-h-[200px]" className="w-full min-w-[500px] flex-1" value={JSON.stringify(rpcResult, null, 4)} content="Rpc Result"></Wrapper>
      </div>

      <div className="w-full h-[1px] bg-[#ffffff3d]" />

      <div className="flex gap-[48px] items-start justify-center">
        <div className="flex gap-[12px] flex-row flex-wrap items-start justify-start">
          <>
            <div className="flex flex-col gap-[12px] items-center">
              <div className="w-min p-[12px] flex border-[1px] border-dashed border-[#fff] gap-[12px] items-center justify-center flex-wrap ">
                <Wrapper onClick={handleInitSDK} value={undefined} content="Init SDK"></Wrapper>
                <Wrapper onClick={handleNewEthereumRpcSigner} value={undefined} content="newEthereumRpcSigner"></Wrapper>

                <div className="w-full h-[1px] bg-[#ffffff3d]" />

                <Wrapper onClick={handleInitInOnce} value={undefined} content="Call in Once"></Wrapper>
              </div>
              <Wrapper onClick={handleVerifySignature} value={undefined} content="Verify Signature" />
            </div>
            <>
              <div className="w-min p-[12px] flex border-[1px] border-dashed border-[#fff] gap-[12px] items-center justify-center flex-wrap ">
                <Wrapper disabled={!_signer} onClick={handleSignerInitZklinkSigner} value={undefined} content="initZklinkSigner"></Wrapper>
                <Wrapper disabled={!_signer} onClick={handleSignerGetPubKey} value={undefined} content="getPubkey"></Wrapper>
                <Wrapper disabled={!_signer} onClick={handlePubkeyHash} value={undefined} content="pubKeyHash"></Wrapper>
                <Wrapper disabled={!_signer} onClick={handleOnboarding} value={undefined} content="Onboarding"></Wrapper>

                <div className="w-full h-[1px] bg-[#ffffff3d]" />

                <Wrapper disabled={!_signer} onClick={handleOnboardingInOnce} value={undefined} content="Call in Once"></Wrapper>
              </div>
              {/* <Wrapper onClick={handleCallInOnce} value={undefined} content="free"></Wrapper> */}

            </>
            {/* <Wrapper value={undefined} content="Personal Sign" /> */}


          </>
        </div>
        <Wrapper textareaClassName="min-h-[200px]" className="w-full flex-1 min-w-[500px]" value={JSON.stringify(signerInfo, null, 4)} content="Signer Info"></Wrapper>
      </div>

    </div>


  );
}
