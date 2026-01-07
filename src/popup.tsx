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
		if (!password || password.length < 8) {
			alert("密码长度不能少于8位");
			return;
		}
		
		try {
			await createWallet(password);
			console.log("钱包创建成功");
		} catch (error) {
			console.error("钱包创建失败，请重试");
		}
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
