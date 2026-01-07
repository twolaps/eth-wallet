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

interface WalletState {
	mnemonic: string | null; //根助记词
	accounts: WalletAccount[];
	currentAccount: WalletAccount | null; //当前账号

	createWallet(password: string): Promise<void>;
	createAccount(password: string): Promise<void>;
	switchAccount(address: string): void;
}

export const useWalletStore = create<WalletState>()(
	persist(
		(set, get) => ({
			mnemonic: null,
			accounts: [],
			currentAccount: null,

			//初始状态
			createWallet: async (password: string) => {
				const {mnemonic, address, privateKey} = await WalletEngine.generateNewWallet();
				const encryptedMnemonic = encryptData(mnemonic, password);

				const firstAccount: WalletAccount = {
					address,
					privateKey,
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

				//只过滤出HD类型账号计算index
				const hdAccounts = state.accounts.filter(
					acc => acc.type === AccountType.HD);

				const newIndex:number = hdAccounts.length;

				//派生新账号
				const {address, privateKey} = await WalletEngine.getWallet(decryptedMnemonic, newIndex);

				const newAccount: WalletAccount = {
					address,
					privateKey,
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