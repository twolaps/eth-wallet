import { useStorage } from "@plasmohq/storage/hook";
import { useState } from "react";
import { encryptData, WalletEngine } from "~lib/wallet-engine"

export const useWalletSetup = () => {

	const [isLoading , setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [mnemonic, setMnemonic] = useStorage<string | null>("mnemonic");


	const setupWallet = async (password: string) => {
		try {
			setIsLoading(true);
			const wallet = WalletEngine.generateNewWallet();
			const encryptedMnemonic = encryptData(wallet.mnemonic, password);
			await setMnemonic(encryptedMnemonic);
			return wallet;
		}
		catch (err) {
			setError("钱包创建失败，请重试。");
			return null;
		}
		finally {
			setIsLoading(false);
		}
	}

	return {
		setupWallet,
		isLoading,
		error,
	}
}