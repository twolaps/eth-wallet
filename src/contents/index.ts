import type { PlasmoCSConfig } from "plasmo";

//让脚本运行在网页的 JS 环境
export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
		world: "MAIN",
}

//注入 API 的逻辑
const injectProvider = () => {
	(window as any).ethereum = {
		isMyWallet: true,
		request: async (request: {method: string, params?: any[]}) => {
			console.log("request", request.method);

			return new Promise((resolve, rejects) => {
				const requestId = Math.random().toString(36).substring(7);

				window.addEventListener("message", (event) => {
					if (event.data.type === "MY_WALLET_RESPONSE" && event.data.requestId === requestId) {
						if (event.data.error) rejects(event.data.error);
						else resolve(event.data.result);
					}
				}, {once: true});

				window.postMessage({
					type: "MY_WALLET_REQUEST",
					requestId,
					method: request.method,
					params: request.params,
				}, "*");
			})
		},
	}
}

injectProvider();