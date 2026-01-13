import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
	matches: ["<all_urls>"],
}

// 监听来自 MAIN 环境的消息
window.addEventListener("message", async (event) => {
	if (event.data.type === "MY_WALLET_REQUEST") {
		const { method, params, requestId } = event.data;

		chrome.runtime.sendMessage({ 
            method, 
            params, 
            requestId // <--- 这里是关键新增
        }, (response) => {
			window.postMessage({
				type: "MY_WALLET_RESPONSE",
				requestId, // 这里使用闭包中的 requestId 回传给 index.ts，这是正确的
				result: response?.result,
				error: response?.error,
			}, "*");
		})
	}
})