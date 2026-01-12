import { WalletEngine } from "~lib/wallet-engine";

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	if (message.method === "eth_sendTransaction") {
		const {to, value} = message.params[0];

		const privateKey =

	}

	return true;
});