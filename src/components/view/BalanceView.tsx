import { useStorage } from "@plasmohq/storage/hook";
import { useEffect, useState } from "react";
import { Button } from "~components/ui/button";
import { Separator } from "~components/ui/separator";
import { WalletEngine } from "~lib/wallet-engine";

interface BalanceViewProps {
	mnemonic: string;
	address: string;
	setAddress: (address: string) => void;
	balance: string;
	setBalance: (balance: string) => void;
}

export const BalanceView = (
	{ 
		mnemonic, address, setAddress, balance, setBalance 
	}: BalanceViewProps) => {


	useEffect(() => {
		if (mnemonic) {
			const wallet = WalletEngine.getWallet(mnemonic);
			if (wallet?.success) {
				setAddress(wallet.address);
			}
		}
	}, [mnemonic]);

	useEffect(() => {
		const getBalance = async () => {
			const balance: string = await WalletEngine.getBalance(address);
			setBalance(balance);
		}

		if (address) {
			getBalance();
		}
	}, [address]);

	return (
    <div className="p-4 w-[500px]">
			<p>Address: {address}</p>
			<Separator className="my-2" />
			<p>Balance: {balance} ETH</p>
    </div>
  )
}