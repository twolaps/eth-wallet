import { useEffect } from "react";
import { Button } from "~components/ui/button";
import { Separator } from "~components/ui/separator";
import { WalletEngine } from "~lib/wallet-engine";
import { SetPasswordView } from "./SetPasswordView";
import { Page } from "~lib/types";

interface BalanceViewProps {
	address: string;
	balance: string;
	setBalance: (balance: string) => void;
	clearCurrentAccount: () => void;
	setPage: (page: Page) => void;
}

export const BalanceView = ({ 
		address, balance, setBalance, clearCurrentAccount,setPage
	}: BalanceViewProps) => {

	const handlerSwitchAccount = () => {
		clearCurrentAccount();
	}

	const handlerSendTransaction = () => {
		console.log("发送交易");
		setPage(Page.TransactView);
	}

	useEffect(() => {
		const getBalance = async () => {
			const balance: string = await WalletEngine.getBalance(address);
			setBalance(balance);
		}

		if (address) {
			getBalance();
		}
	}, [address, setBalance]);

	return (
    <div className="gap-2 w-[500px] flex flex-col items-start justify-center">
			<Button onClick={handlerSwitchAccount}>切换账号</Button>

			<div>
				<p>Address:</p>
				<p>{address}</p>
				<Separator className="my-2" />
				<p>Balance: {balance} ETH</p>
				<Button onClick={handlerSendTransaction}>发送交易</Button>

			</div>
			
		</div>
	);
};