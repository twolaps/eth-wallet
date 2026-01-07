import "./globals.css"
import { Buffer } from "buffer"
import process from "process"
import { useEffect, useState } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { BalanceView } from "~components/view/BalanceView"
import { Page } from "~lib/types"
import { SetPasswordView } from "~components/view/SetPasswordView"
import { WelcomePage } from "~components/view/WelcomePage"
import { LoginView } from "~components/view/LoginView"
import { useWalletSetup } from "~hooks/useWalletSetup"

if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer
  window.process = process
}

function IndexPopup() {
	const [mnemonic, setMnemonic] = useStorage<string>("mnemonic");
	const [decryptedMnemonic, setDecryptedMnemonic] = useState<string>("");
	const [address, setAddress] = useState<string>("0x00");
	const [balance, setBalance] = useState<string>("0.0000");
	const [password, setPassword] = useState<string>("");
	const [page, setPage] = useState<Page>(Page.Welcome);
	const { setupWallet, isLoading, error } = useWalletSetup();


	const	handleSetupPassword = async (password: string) => {
		const result = await setupWallet(password);
		if(result){
			setPassword(password);
			setDecryptedMnemonic(result.mnemonic);
			setAddress(result.address);

			setPage(Page.BalanceView);
		}
	}

	let contentView: JSX.Element;
	switch (page) {
		case Page.SetPassword:
			contentView = <SetPasswordView handleSetupPassword={handleSetupPassword}/>;
			break;
		case Page.Welcome:
			contentView = <WelcomePage setPage={setPage} />;
			break;
		case Page.BalanceView:
			contentView = 
				<BalanceView 
					mnemonic={mnemonic}
					setMnemonic={setMnemonic}
					address={address}
					setAddress={setAddress}
					balance={balance}
					setBalance={setBalance} />;
			break;
		case Page.Login:
			contentView = <LoginView  setPassword={setPassword}/>
			break;
		default:
			contentView = <WelcomePage setPage={setPage} />;
	}

	useEffect(() => {
		if (decryptedMnemonic) {
			setPage(Page.BalanceView);
		} 
		else if (mnemonic) {
			setPage(Page.Login);
		}
		else {
			setPage(Page.Welcome);
		}
	}, [mnemonic]);

  return (
    <div className="p-4 w-[500px]">
			{contentView}
    </div>
  )
}

export default IndexPopup
