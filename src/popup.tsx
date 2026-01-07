import { useWalletStore } from "~stores/walletStores";
import "./globals.css"
import { useState } from "react";
import { SetPasswordView } from "~components/view/SetPasswordView";

function IndexPopup() {

	// setAccounts([]);
	// setDecryptedMnemonic(null);
	// setCurIndex(0);

	const {	
		mnemonic,
		accounts,
		currentAccount,
		createWallet,
		createAccount } = useWalletStore();

	const handleSetupPassword = async (password: string) => {
		
	}

	const [password, setPassword] = useState("");
	//1. 没有助记词，显示创建钱包界面
	let contentJSX: JSX.Element = null;
	if (!mnemonic) {
		contentJSX = <SetPasswordView handleSetupPassword={handleSetupPassword} />
	}
	else {
		contentJSX = <div>钱包已创建，当前账户：{currentAccount?.address}</div>
	}

  return (
    <div className="p-4 w-[500px]">
			{contentJSX}
    </div>
  )
}

export default IndexPopup
