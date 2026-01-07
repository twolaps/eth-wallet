import { useStorage } from "@plasmohq/storage/hook";
import { useEffect, useState } from "react";
import { Button } from "~components/ui/button";
import { Separator } from "~components/ui/separator";
import { WalletEngine } from "~lib/wallet-engine";

interface BalanceViewProps {
	address: string;
	balance: string;
	setBalance: (balance: string) => void;
	clearCurrentAccount: () => void;
}

export const BalanceView = ({ 
		address, balance, setBalance, clearCurrentAccount,
	}: BalanceViewProps) => {

	const handlerSwitchAccount = () => {
		clearCurrentAccount();
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
			</div>
			
		</div>
	);
};