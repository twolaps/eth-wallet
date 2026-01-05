import "./globals.css"
import { Buffer } from "buffer"
import process from "process"
import { useEffect, useState } from "react"
import { Separator } from "~components/ui/separator"
import { WalletEngine } from "~lib/wallet-engine"
import { useStorage } from "@plasmohq/storage/hook"
import { SetPasswordView } from "~components/view/SetPasswordView"
import { BalanceView } from "~components/view/BalanceView"

if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer
  window.process = process
}

function IndexPopup() {
	const [mnemonic, setMnemonic] = useStorage<string>("mnemonic");
	const [address, setAddress] = useState<string>("0x00");
	const [balance, setBalance] = useState<string>("0.0000");

	let contentView: JSX.Element;

	if (mnemonic) {
		contentView = 
		<BalanceView 
			mnemonic={mnemonic}
			setMnemonic={setMnemonic}
			address={address}
			setAddress={setAddress}
			balance={balance}
			setBalance={setBalance} />;
	} else {
		contentView = <SetPasswordView />;
	}
	
  return (
    <div className="p-4 w-[500px]">
			{contentView}
    </div>
  )
}

export default IndexPopup
