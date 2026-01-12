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
		},
	}
}

injectProvider();