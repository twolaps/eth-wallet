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
import { Storage } from "@plasmohq/storage"
import { decryptData, WalletEngine } from "~lib/wallet-engine"

if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer
  window.process = process
}

const sessionStorage = new Storage({area: "session"});

function IndexPopup() {
	const [mnemonic, setMnemonic] = useStorage<string>("mnemonic");
	const [decryptedMnemonic, setDecryptedMnemonic] = useStorage<string>({
		key: "decryptedMnemonic",
		instance: sessionStorage,
	});
	const [address, setAddress] = useState<string>("0x00");
	const [balance, setBalance] = useState<string>("0.0000");
	const [password, setPassword] = useState<string>("");
	const [page, setPage] = useState<Page>(Page.Welcome);
	const { setupWallet, isLoading, error } = useWalletSetup();

	// setMnemonic(null);
	// setDecryptedMnemonic(null);

	const	handleSetupPassword = async (password: string) => {
		const result = await setupWallet(password);
		if(result){
			setPassword(password);
			setDecryptedMnemonic(result.mnemonic);
			setAddress(result.address);

			setPage(Page.BalanceView);
		}
	}

	const handleLogin = async (password: string) => {
		const resultMnemonic = await decryptData(mnemonic, password);
		if(resultMnemonic && resultMnemonic.length > 0){
			setDecryptedMnemonic(resultMnemonic);
			setPassword(password);
			const result = WalletEngine.getWallet(resultMnemonic, 0);
			if (!result.success) {
				alert("密码错误");
			}
			else {
				setAddress(result.address);
				setPage(Page.BalanceView);
			}

		}
		else {
			alert("密码错误");
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
					mnemonic={decryptedMnemonic}
					address={address}
					setAddress={setAddress}
					balance={balance}
					setBalance={setBalance} />;
			break;
		case Page.Login:
			contentView = <LoginView handleLogin={handleLogin}/>
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
	}, [mnemonic, decryptedMnemonic]);

  return (
    <div className="p-4 w-[500px]">
			{contentView}
    </div>
  )
}

export default IndexPopup
