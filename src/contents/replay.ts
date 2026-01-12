import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
	matches: ["<all_urls>"],
}

//监听来自MAIN环境的消息
window.addEventListener("message", async (event) =>{
	if (event.data.type === "MY_WALLET_REQUEST") {
		const {method, params, requestId} = event.data;

		//将消息转发给插件后台background
		chrome.runtime.sendMessage({method, params}, (response) => {
			window.postMessage({
				type: "MY_WALLET_RESPONSE",
				requestId,
				result: response?.result,
				error: response?.error,
			}, "*");
		})
	}
})