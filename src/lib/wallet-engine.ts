import { formatEther, HDNodeWallet, JsonRpcProvider, Wallet } from "ethers"

const SEPOLIA_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/EI-sjwkwnRwHeb_D6_FsC";

export const WalletEngine = {
	
	generateNewWallet: (): { address: string; mnemonic: string; privateKey: string } => {
		const wallet: HDNodeWallet = Wallet.createRandom();
		const result = {
			address: wallet.address,
			mnemonic: wallet.mnemonic.phrase,
			privateKey: wallet.privateKey
		}

		console.log("--- 新钱包已生成 ---")
    console.log("地址:", result.address)
    console.log("助记词:", result.mnemonic)
    console.log("私钥:", result.privateKey)
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
	}

}