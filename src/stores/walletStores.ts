import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { decryptData, encryptData, WalletEngine } from "~lib/wallet-engine";

export enum AccountType {
	HD = "hd",
	IMPORTED = "imported",
}

export interface WalletAccount {
	address: string;
	privateKey: string | null;
	name: string;
	index: number;
	type: AccountType;
}

export interface PendingTransaction {
	to: string;
	value: string;
	requestId: string;
	status?: 'pending' | 'confirmed' | 'failed' | 'cancelled'; // 新增
	txHash?: string; // 新增
	error?: string;  // 新增
}

interface WalletState {
	mnemonic: string | null; //根助记词
	accounts: WalletAccount[];
	currentAccount: WalletAccount | null; //当前账号

	createWallet(password: string): Promise<void>;
	createAccount(password: string): Promise<void>;
	switchAccount(address: string): void;
	importAccount: (privateKey: string, password: string, name: string) => Promise<void>;
	getPrivateKey: (password: string) => Promise<string | null>;
	clearCurrentAccount: () => void;
	resetWallet: () => void;

	pendingTx: PendingTransaction | null;
	setPendingTx: (tx: PendingTransaction | null) => void;
}

export const useWalletStore = create<WalletState>()(
	persist(
		(set, get) => ({
			mnemonic: null,
			accounts: [],
			currentAccount: null,

			//初始状态
			createWallet: async (password: string) => {
				const {mnemonic, address} = await WalletEngine.generateNewWallet();
				const encryptedMnemonic = encryptData(mnemonic, password);

				const firstAccount: WalletAccount = {
					address,
					privateKey: null,
					name: "Account 1",
					index: 0,
					type: AccountType.HD,
				};

				set({
					mnemonic: encryptedMnemonic,
					accounts: [firstAccount],
					currentAccount: firstAccount,
				});
			},


			//创建新账户：基于根助记词增加index
			createAccount: async (password: string) => {
				const state = get();
				if (!state.mnemonic) throw new Error("No mnemonic found");

				//解密根助记词
				const decryptedMnemonic = decryptData(state.mnemonic, password);
				if (!decryptedMnemonic) throw new Error("Invalid password");

				const newIndex:number = state.accounts.length;

				//派生新账号
				const {address} = await WalletEngine.getWallet(decryptedMnemonic, newIndex);

				const newAccount: WalletAccount = {
					address,
					privateKey: null,
					name: `Account ${newIndex + 1}`,
					index: newIndex,
					type: AccountType.HD,
				};

				set({
					accounts: [...state.accounts, newAccount],
					currentAccount: newAccount,
				});
			},


			//切换当前选中的账号
			switchAccount: (address: string) => {
				const {accounts} = get();
				const targetAccount = accounts.find(acc => acc.address === address);
				if (targetAccount) {
					set({currentAccount: targetAccount});
				}
			},

			//从私钥导入账号
			importAccount: async (privateKey: string, password: string, name: string) => {
				//验证私钥并获取地址
				const wallet = WalletEngine.importWalletFromPrivateKey(privateKey);
				if (!wallet.success) throw new Error(wallet.error || "导入钱包失败");

				//检查是否已存在该地址的账号
				const state = get();
				const existingAccount = state.accounts.find(acc => acc.address === wallet.address);
				if (existingAccount) throw new Error("该账户已存在");

				//加密私钥
				const encryptedPrivateKey = encryptData(privateKey, password);
				const maxIndex = state.accounts.length;

				const newAccount: WalletAccount = {
					address: wallet.address,
					privateKey: encryptedPrivateKey,
					name: name || `Imported Account ${maxIndex + 1}`,
					index: maxIndex,
					type: AccountType.IMPORTED,
				};

				set({
					accounts: [...state.accounts, newAccount],
					currentAccount: newAccount,
				});
				console.log("账号导入成功", newAccount);
			},

			getPrivateKey: async (password: string) => {
				const state = get();
				const account = state.currentAccount;
				if (!account) throw new Error("No account found");
				if (account.type === AccountType.IMPORTED) {
					if (!account.privateKey) throw new Error("No private key found");
					const decryptedPrivateKey = decryptData(account.privateKey, password);
					if (!decryptedPrivateKey) throw new Error("Invalid password");
					return decryptedPrivateKey;
				}
				else {
					if (!state.mnemonic) throw new Error("No mnemonic found");
					const decryptedMnemonic = decryptData(state.mnemonic, password);
					if (!decryptedMnemonic) throw new Error("Invalid password");
					const wallet = await WalletEngine.getWallet(decryptedMnemonic, account.index);
					if (!wallet.success) throw new Error(wallet.error || "Invalid password");
					return wallet.privateKey;
				}
			},

			clearCurrentAccount: () => {
				set({currentAccount: null});
			},

			resetWallet: () => {
				set({
					mnemonic: null,
					accounts: [],
					currentAccount: null,
				});
			},

			pendingTx: null,
			setPendingTx: (tx: PendingTransaction | null) => {
				set({pendingTx: tx});
			},
		}),

		{
			name: 'wallet-storage', // 存储名称
			storage: {
				getItem: async (name) =>{
					const result = await chrome.storage.local.get(name);
					return result[name] || null;
				},

				setItem: async (name, value) => {
					await chrome.storage.local.set({ [name]: value });
				},

				removeItem: async (name) => {
					await chrome.storage.local.remove(name);
				}
			}
		}
	)
);