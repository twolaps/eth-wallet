import { useState } from "react";
import { Button } from "~components/ui/button";
import { Input } from "~components/ui/input";
import type { Page } from "~lib/types";
import { WalletEngine } from "~lib/wallet-engine";
import { useWalletStore } from "~stores/walletStores";

interface TransactViewProps {
	setPage: (page: Page) => void;
	balance: string;
	setBalance: (balance: string) => void;
}
export const TransactView = ({ setPage, balance, setBalance }: TransactViewProps) => {

	const {getPrivateKey, currentAccount} = useWalletStore();
	const [address, setAddress] = useState<string>("");
	const [amount, setAmount] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);


	const onClickSendTransaction = async () => {
		if (address === "" || amount === "") {
			alert("请输入接收方账号地址和发送金额");
			return;
		}
		// 验证地址格式
		if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
			alert("请输入有效的以太坊地址");
			return;
		}

		// 验证金额
		const amountNum = parseFloat(amount);
		if (isNaN(amountNum) || amountNum <= 0) {
			alert("请输入有效的金额");
			return;
		}

		// 检查余额是否足够
		const balanceNum = parseFloat(balance);
		if (amountNum > balanceNum) {
			alert("余额不足");
			return;
		}

		if (password === "") {
			alert("请输入密码");
			return;
		}

		try {
			const privateKey = await getPrivateKey(password);
			if (!privateKey) {
				alert("获取私钥失败");
				return;
			}

			setIsLoading(true);
			//发送交易
			const result = await WalletEngine.sendTransaction(
				privateKey,
				address,
				amount,
			);

			if (result.success) {
				alert(`转账成功，交易哈希：${result.txHash}`);
				//清空表单
				setAddress("");
				setAmount("");
				setPassword("");

				//刷新余额
				if (currentAccount) {
					const newBalance = await WalletEngine.getBalance(currentAccount.address);
					setBalance(newBalance);
				}
				else {
					setBalance("0.0000");
				}
			}
			else {
				alert("转账失败：" + result.error);
			}
		}
		catch (error) {
			alert("发送交易失败，请检查密码" + (error as Error).message);
		}
		finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="gap-2 flex flex-col items-start justify-center">
			<p>请输入接收方账号地址</p>
			<Input className="!text-xs" type="text" placeholder="请输入接收方账号地址" value={address} onChange={e => setAddress(e.target.value)}/>
			<p className="mt-2">请输入发送金额</p>
			<div className="flex items-center gap-2">
				<Input type="number" placeholder="请输入发送金额" value={amount} onChange={e => setAmount(e.target.value)}/>
				<p>ETH</p>
			</div>
			<p>余额：{balance} ETH</p>
			<p className="mt-2">请输入密码</p>
			<Input type="password" placeholder="请输入密码" value={password} onChange={e => setPassword(e.target.value)}/>

			<Button onClick={onClickSendTransaction} disabled={isLoading}>{isLoading ? "发送中..." : "发送交易"}</Button>
		</div>
	)
}