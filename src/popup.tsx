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
	const handleConfirmTx = async (txPassword: string) => {
		if (!pendingTx) return;
		
		// 检查密码是否已设置
		if (!txPassword) {
			alert("请输入密码");
			return;
		}

		try {
			const privateKey = await getPrivateKey(txPassword);
			if (!privateKey) throw new Error("私钥获取失败，请检查密码");

			// 更新交易状态为确认中
			const updatedTx = { ...pendingTx, status: 'pending' as const };
			setPendingTx(updatedTx);

			// 发送交易并等待结果
			const result = await WalletEngine.sendTransaction(
				privateKey, 
				pendingTx.to, 
				pendingTx.value
			);

			if (result.success && result.txHash) {
				// 交易成功，存储交易哈希
				const successTx = { 
					...pendingTx, 
					status: 'confirmed' as const,
					txHash: result.txHash
				};
				setPendingTx(successTx);
				
				// 延迟清除，让 background script 有时间读取结果
				setTimeout(() => {
					setPendingTx(null);
				}, 1000);
				
				alert(`交易成功！\n交易哈希: ${result.txHash}`);
			} else {
				// 交易失败
				const failedTx = { 
					...pendingTx, 
					status: 'failed' as const,
					error: result.error || '交易失败'
				};
				setPendingTx(failedTx);
				
				setTimeout(() => {
					setPendingTx(null);
				}, 1000);
				
				alert(`交易失败：${result.error || '未知错误'}`);
			}
		}
		catch (error: any) {
			console.error("交易处理失败：", error);
			
			// 标记交易失败
			const failedTx = { 
				...pendingTx, 
				status: 'failed' as const,
				error: error.message || '交易处理失败'
			};
			setPendingTx(failedTx);
			
			setTimeout(() => {
				setPendingTx(null);
			}, 1000);
			
			alert(`交易失败：${error.message || '未知错误'}`);
		}
	}

	// 处理取消转账
	const handleCancelTx = () => {
		if (!pendingTx) return;
		
		// 标记交易为已取消
		const cancelledTx = { 
			...pendingTx, 
			status: 'cancelled' as const
		};
		setPendingTx(cancelledTx);
		
		// 延迟清除，让 background script 有时间读取结果
		setTimeout(() => {
			setPendingTx(null);
		}, 1000);
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

	// 优先显示交易确认界面
	if (pendingTx) {
		contentJSX = <TxConfirm 
			pendingTx={pendingTx} 
			handleConfirmTx={handleConfirmTx} 
			handleCancel={handleCancelTx}
		/>
	}
	// 如果有明确的页面状态，显示对应页面
	else if (page === Page.ImportedView) {
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
	// 如果有当前账户，显示余额页面（这是默认的主页面）
	else if (mnemonic && accounts.length > 0 && currentAccount) {
		contentJSX = <BalanceView 
			address={currentAccount.address}
			balance={balance}
			setBalance={setBalance}
			clearCurrentAccount={clearCurrentAccount}
			setPage={setPage}
		/>
	}
	// 否则显示账户列表
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
