import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN",
}

const injectProvider = () => {
  (window as any).mywallet = {
    isMyWallet: true,
    request: async (request: { method: string, params?: any[] }) => {
      console.log("🟦 [Index] 1. 用户发起请求:", request.method);
      return provider.request(request);
    },
    transfer: async (to: string, amount: string) => {
      console.log("🟦 [Index] 发起 Transfer:", to);
      return provider.request({
        method: "eth_sendTransaction",
        params: [{ to, value: amount }]
      });
    }
  }
}

const provider = {
  request: async (request: { method: string, params?: any[] }) => {
    return new Promise((resolve, rejects) => {
      const requestId = Math.random().toString(36).substring(7);

      // 监听回复
      const listener = (event: MessageEvent) => {
        if (event.data.type === "MY_WALLET_RESPONSE" && event.data.requestId === requestId) {
          console.log("🟦 [Index] 5. 收到最终结果:", event.data);
          window.removeEventListener("message", listener);
          if (event.data.error) rejects(event.data.error);
          else resolve(event.data.result);
        }
      };
      window.addEventListener("message", listener);

      // 发送消息
      console.log("🟦 [Index] 2. 发送 PostMessage 给 Replay, ID:", requestId);
      window.postMessage({
        type: "MY_WALLET_REQUEST",
        requestId,
        method: request.method,
        params: request.params,
      }, "*");
    });
  }
};

injectProvider();