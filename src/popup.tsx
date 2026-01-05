import "./globals.css"
import { Buffer } from "buffer"
import process from "process"
import { useEffect, useState } from "react"
import { Separator } from "~components/ui/separator"
import { WalletEngine } from "~lib/wallet-engine"
import { useStorage } from "@plasmohq/storage/hook"
import { Button } from "~components/ui/button"

if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer
  window.process = process
}

function IndexPopup() {
	const [mnemonic, setMnemonic] = useStorage<string>("mnemonic");
	const [address, setAddress] = useState<string>("0x00");
	const [balance, setBalance] = useState<string>("0.0000");

	const onClickCreateWallet = () => {
		const wallet = WalletEngine.generateNewWallet();
		setMnemonic(wallet.mnemonic);
	}

	useEffect(() => {
		if (mnemonic) {
			const wallet = WalletEngine.getWallet(mnemonic);
			if (wallet?.success) {
				setAddress(wallet.address);
			}
		}
	}, [mnemonic]);

	useEffect(() => {
		const getBalance = async () => {
			const balance: string = await WalletEngine.getBalance(address);
			setBalance(balance);
		}

		if (address) {
			getBalance();
		}
	}, [address]);
  return (
    <div className="p-4 w-[500px]">
			{
				mnemonic ? (
					<p>Address: {address}</p>
				) : (
					<Button onClick={onClickCreateWallet}>Create New Wallet</Button>
				)
			}
			<Separator className="my-2" />
			<p>Balance: {balance} ETH</p>
    </div>
  )
}

export default IndexPopup
