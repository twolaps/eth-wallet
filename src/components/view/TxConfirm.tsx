import { Button } from "~components/ui/button"
import { Input } from "~components/ui/input"
import { useState } from "react"
import type { ChangeEvent } from "react"
import type { PendingTransaction } from "~stores/walletStores";

interface TxConfirmProps {
	pendingTx: PendingTransaction;
	handleConfirmTx: (password: string) => void;
	setPendingTx: (tx: PendingTransaction | null) => void;
}
export const TxConfirm = ({ pendingTx, handleConfirmTx, setPendingTx }: TxConfirmProps) => {
	const [password, setPassword] = useState<string>("");

	const onChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
		const value: string = e.target.value;
		setPassword(value);
	}

	const onConfirm = () => {
		if (!password) {
			alert("请输入密码");
			return;
		}
		handleConfirmTx(password);
		setPassword("");
	}

	return (
		<div className="flex flex-col gap-2 items-center">
			<h1>确认转账</h1>
			<p>收款地址: {pendingTx?.to}</p>
			<p>转账金额: {pendingTx?.value}</p>
			<Input type="password" placeholder="请输入密码" value={password} onChange={onChangePassword}/>
			<Button onClick={onConfirm}>确认转账</Button>
			<Button onClick={()=> setPendingTx(null)}>取消转账</Button>
		</div>
	)
}