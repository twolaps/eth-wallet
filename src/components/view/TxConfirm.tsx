// src/components/view/TxConfirm.tsx

import { Button } from "~components/ui/button"
import { Input } from "~components/ui/input"
import { useState } from "react"
import type { ChangeEvent } from "react"
import type { PendingTransaction } from "~stores/walletStores";

interface TxConfirmProps {
	pendingTx: PendingTransaction;
	handleConfirmTx: (password: string) => void;
	handleCancel: () => void;
}

export const TxConfirm = ({ pendingTx, handleConfirmTx, handleCancel }: TxConfirmProps) => {
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
		<div className="flex flex-col gap-4 p-4 items-center justify-center h-full">
			<h1 className="text-xl font-bold">确认转账</h1>
			
			<div className="w-full space-y-2 text-sm border p-4 rounded-md">
				<div className="flex justify-between">
					<span className="font-semibold">收款地址:</span>
					<span className="truncate w-32 text-right" title={pendingTx?.to}>{pendingTx?.to}</span>
				</div>
				<div className="flex justify-between">
					<span className="font-semibold">金额:</span>
					<span>{pendingTx?.value} ETH</span>
				</div>
			</div>

			<div className="w-full space-y-2">
				<Input 
					type="password" 
					placeholder="请输入钱包密码确认" 
					value={password} 
					onChange={onChangePassword}
				/>
			</div>

			<div className="flex gap-4 w-full mt-4">
				<Button variant="outline" className="flex-1" onClick={handleCancel}>
					取消
				</Button>
				<Button className="flex-1" onClick={onConfirm}>
					确认发送
				</Button>
			</div>
		</div>
	)
}