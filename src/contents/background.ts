import { WalletEngine } from "~lib/wallet-engine";
import { Storage } from "@plasmohq/storage";

const storage = new Storage();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.method === "eth_requestAccounts") {
		// 处理连接钱包的逻辑
		handleConnect(sendResponse);
		return true;
	}
});

async function handleConnect(sendResponse: (response?: any) => void) {
	try {
		// 1. 从存储中获取钱包信息
		// 在 useWalletSetup.ts 中，使用了 setWallet("wallet", ...) 保存信息
		const wallet = await storage.get<any>("wallet");
		if (wallet && wallet.address) {
			// 2. 按照 EIP-1193 标准，连接成功应返回一个包含地址的数组
			console.log("DApp 已连接到地址:", wallet.address);
			sendResponse({result: [wallet.address]});
		}
		else {
			// 3. 如果没有钱包，返回错误提示
			sendResponse({
				error: {
					code: 4001,
					message: "用户未初始化钱包，请先在插件中创建或导入账户",
				}
			});
		}
	}
	catch(error) {
		sendResponse({error: error.message});
	}
}