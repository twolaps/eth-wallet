import { WalletEngine } from "~lib/wallet-engine";
import { Storage } from "@plasmohq/storage";

const storage = new Storage();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	// 1. 处理连接钱包的逻辑
	if (message.method === "eth_requestAccounts") {
		handleConnect(sendResponse);
		return true;
	}
	// 2. 处理获取链ID请求
	else if (message.method === "eth_chainId") {
		sendResponse({ result: "0xaa36a7" });
		return true;
	}

	else if (message.method === "eth_sendTransaction") {
		const txParams = message.params[0];
		//将交易存入storage,通知Popup显示确认界面
		//注意：这里通过chrome.storage修改Zustand储存的key('wallet-storage')
		handlePendingTx(txParams, message.requestId);
		return true;
	}
});

async function handlePendingTx(params: any, requestId: string) {
	const storageData = await chrome.storage.local.get("wallet-storage");
	if (storageData["wallet-storage"]) {
		const data = JSON.parse(storageData["wallet-storage"]);
		data.state.pendingTx = {
				to: params.to,
				value: params.value,
				requestId: requestId,
		}
		await chrome.storage.local.set({
			"wallet-storage": JSON.stringify(data),
		});
	}
}

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