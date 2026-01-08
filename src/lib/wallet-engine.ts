import { AES, enc } from "crypto-js"

import { FeeData, formatEther, HDNodeWallet, JsonRpcProvider, parseEther, Wallet } from "ethers"

const SEPOLIA_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/EI-sjwkwnRwHeb_D6_FsC";

export interface AccountInfo {
	address: string;
	mnemonicID: string;
	index: number;
}

export const WalletEngine = {
	
	generateNewWallet: (): { address: string; mnemonic: string; privateKey: string } => {
		const wallet: HDNodeWallet = Wallet.createRandom();
		const result = {
			address: wallet.address,
			mnemonic: wallet.mnemonic.phrase,
			privateKey: wallet.privateKey
		}

		return result;
	},

	getWallet: (mnemonic: string, index: number = 0) => {
		try {
			const path: string = `m/44'/60'/0'/0/${index}`;
			const wallet: HDNodeWallet = HDNodeWallet.fromPhrase(mnemonic, undefined, path);
			return {
				success: true,
				address: wallet.address,
				privateKey: wallet.privateKey,
			}
		}
		catch (error) {
			console.error("助记词无效:", error);
			return {success: false, error: "助记词无效"};
		}
	},

	getBalance: async (address: string): Promise<string> => {
		try {
			const provider: JsonRpcProvider = new JsonRpcProvider(SEPOLIA_RPC_URL);
			const balance: bigint = await provider.getBalance(address);
			return Number(formatEther(balance)).toFixed(4) || "0.0000";
		}
		catch (error) {
			console.error("获取余额失败:", error);
			return "0.0000";
		}
	},

	importWalletFromPrivateKey: (privateKey: string) => {
		try {
			const wallet: Wallet = new Wallet(privateKey);
			return {
				success: true,
				address: wallet.address,
				privateKey: wallet.privateKey,
			}
		}
		catch (error) {
			console.error("导入钱包失败:", error);
			return {success: false, error: "导入钱包失败"};
		}
	},

	sendTransaction: async (
		privateKey: string,
		to: string,
		amount: string
	) : Promise<{success: boolean, txHash?: string, error?: string}> => {

		try {
			const provider: JsonRpcProvider = new JsonRpcProvider(SEPOLIA_RPC_URL);
			const wallet: Wallet = new Wallet(privateKey, provider);

			//将eth金额转为wei
			const amountInWei = parseEther(amount);

			//获取gas
			const feeData: FeeData = await provider.getFeeData();

			//发送交易
			const tx = await wallet.sendTransaction({
				to,
				value: amountInWei,
				gasLimit: 21000,
				gasPrice: feeData.gasPrice,
			});

			await tx.wait();

			return {
				success: true,
				txHash: tx.hash,
			};
		}
		catch (error) {
			console.error("发送交易失败:", error);
			return {success: false, error: "发送交易失败"};
		}
	}
};

export const encryptData = (mnemonic: string, password: string): string => {
	return AES.encrypt(mnemonic, password).toString();
}

export const decryptData = (ciphertext: string, password: string): string | null => {
	const bytes = AES.decrypt(ciphertext, password);
	const decryptedData = bytes.toString(enc.Utf8);
	return decryptedData || null;
}