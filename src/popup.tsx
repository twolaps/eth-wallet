import { useWalletStore } from "~stores/walletStores";
import "./globals.css"
import { useState } from "react";
import { SetPasswordView } from "~components/view/SetPasswordView";
import { AccountView } from "~components/view/AccountView";
import { Page } from "~lib/types";
import { BalanceView } from "~components/view/BalanceView";
import { LoginView } from "~components/view/LoginView";
import { ImportedView } from "~components/view/ImportedView";
import { TransactView } from "~components/view/TransactView";
import { CreateAccountView } from "~components/view/CreateAccountView";
import { TxConfirm } from "~components/view/TxConfirm";
import { WalletEngine } from "~lib/wallet-engine";

function IndexPopup() {


	const [page, setPage] = useState<Page | null>(null);
	const [balance, setBalance] = useState<string>("0.0000");
	const [password, setPassword] = useState<string>("");

	const {	
		mnemonic,
		accounts,
		currentAccount,
		createWallet,
		createAccount,
		importAccount,
		clearCurrentAccount,
		resetWallet,
		pendingTx,
		setPendingTx,
		getPrivateKey} = useWalletStore();

	//处理确认转账
	const handleConfirmTx = async () => {
		if (!pendingTx) return;
		try {
			const privateKey = await getPrivateKey(password);
			if (!privateKey) throw new Error("私钥获取失败");
			WalletEngine.sendTransaction(privateKey, pendingTx.to, pendingTx.value);
			setPendingTx(null);
		}
		catch (error) {
			console.error("交易处理失败：", error);
			setPendingTx(null);
		}
	}

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

	const handleLogin = async (password: string) => {
		setPassword(password);
	}

	const handlerImportAccount = async (privateKey: string, password: string, name: string) => {
		try {
			await importAccount(privateKey, password, name || "Imported Account");
			alert("账户导入成功");
			setPage(null);
		}
		catch (error: any) {
			alert("导入失败：" + (error.message || "请检查私钥或密码"));
		}
	}
	
	let contentJSX: JSX.Element = null;

	if (pendingTx) {
		contentJSX = <TxConfirm pendingTx={pendingTx} handleConfirmTx={handleConfirmTx} setPendingTx={setPendingTx}/>
	}
	if (page === Page.ImportedView) {
		contentJSX = <ImportedView setPage={setPage} importAccount={handlerImportAccount}/>
	}
	else if (page === Page.CreateAccountView) {
		contentJSX = <CreateAccountView setPage={setPage}/>
	}
	else if (page === Page.TransactView) {
		contentJSX = <TransactView setPage={setPage} balance={balance} setBalance={setBalance}/>
	}
	//1. 没有助记词，显示创建钱包界面
	else if (!mnemonic) {
		contentJSX = <SetPasswordView handleSetupPassword={handleSetupPassword} />
	}
	else if (mnemonic && accounts.length === 0) {
		contentJSX = <LoginView handleLogin={handleLogin} />
	}
	else if (mnemonic && accounts.length > 0 && currentAccount) {
		contentJSX = <BalanceView 
			address={currentAccount.address}
			balance={balance}
			setBalance={setBalance}
			clearCurrentAccount={clearCurrentAccount}
			setPage={setPage}
		/>
	}
	else {
		contentJSX = <AccountView accounts={accounts} setPage={setPage}/>
	}

  return (
    <div className="p-4 w-[500px] h-[500px]">
			{contentJSX}
    </div>
  )
}

export default IndexPopup
