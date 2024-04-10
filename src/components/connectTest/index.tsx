import { Button } from "@radix-ui/themes"
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react"
import ConnectButton from "../connectButton"
import { useAccount, useDisconnect } from "wagmi"

const ConnectTest = () => {
    const { address, isConnected, isConnecting, isDisconnected} = useAccount()


    const { open } = useWeb3Modal()
    const { disconnect } = useDisconnect()
    const { selectedNetworkId } = useWeb3ModalState()


    const handleOpen = ()=>{
        if(isConnected){
            open({ view: 'Account' })
            return;
        }
        open({ view: 'Connect' })
    }

    const handleDisconnect = ()=>{
        disconnect()
    }
    return (
        <>
            <div className="flex flex-col gap-[12px]">
                <ConnectButton />
                <div className='flex flex-row gap-[12px]'>
                    <Button onClick={handleOpen}>{isConnected ? 'Info' : 'Connect'}</Button>
                    <Button onClick={handleDisconnect}>Disconnect</Button>
                </div>
                <div className="flex flex-col">
                    <div>INFOs</div>
                    <div>connect status: {isConnected ? 'isConnected' : isConnecting ? 'isConnecting' : isDisconnected ? 'isDisconnected' : 'unknown'}</div>
                    <div>address: {address}</div>
                    <div>chainId: {selectedNetworkId}</div>
                </div>
            </div>
        </>
    )


}
export default ConnectTest