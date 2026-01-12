import { Button } from "~components/ui/button"
import type { PendingTransaction } from "~stores/walletStores";

interface TxConfirmProps {
	pendingTx: PendingTransaction;
	handleConfirmTx: () => void;
	setPendingTx: (tx: PendingTransaction | null) => void;
}
export const TxConfirm = ({ pendingTx, handleConfirmTx, setPendingTx }: TxConfirmProps) => {
	return (
		<div className="flex flex-col gap-2 items-center">
			<h1>确认转账</h1>
			<p>收款地址: {pendingTx?.to}</p>
			<p>转账金额: {pendingTx?.value}</p>
			<Button onClick={handleConfirmTx}>确认转账</Button>
			<Button onClick={()=> setPendingTx(null)}>取消转账</Button>
		</div>
	)
}