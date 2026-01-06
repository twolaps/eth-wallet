import "./globals.css"
import { Buffer } from "buffer"
import process from "process"
import { useEffect, useState } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { BalanceView } from "~components/view/BalanceView"
import { Page } from "~lib/types"
import { SetPasswordView } from "~components/view/SetPasswordView"
import { WelcomePage } from "~components/view/WelcomePage"

if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer
  window.process = process
}

function IndexPopup() {
	const [mnemonic, setMnemonic] = useStorage<string>("mnemonic");
	const [address, setAddress] = useState<string>("0x00");
	const [balance, setBalance] = useState<string>("0.0000");
	const [password, setPassword] = useState<string>("");
	const [page, setPage] = useState<Page>(Page.Welcome);

	let contentView: JSX.Element;
	useEffect(() => {
		switch (page) {
			case Page.SetPassword:
				console.log(1);
				contentView = <SetPasswordView setPassword={setPassword} />;
				break;
			case Page.Welcome:
				console.log(2);
				contentView = <WelcomePage setPage={setPage} />;
				break;
			case Page.BalanceView:
				console.log(3);
				contentView = 
					<BalanceView 
						mnemonic={mnemonic}
						setMnemonic={setMnemonic}
						address={address}
						setAddress={setAddress}
						balance={balance}
						setBalance={setBalance} />;
				break;
			default:
				console.log(4);
				contentView = <WelcomePage setPage={setPage} />;
		}
	}, [page]);
	
  return (
    <div className="p-4 w-[500px]">
			{contentView}
    </div>
  )
}

export default IndexPopup
