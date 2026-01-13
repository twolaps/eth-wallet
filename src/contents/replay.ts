import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
}

// 监听来自 MAIN 环境的消息
window.addEventListener("message", async (event) => {
  // 只处理我们自己的请求
  if (event.source !== window || !event.data || event.data.type !== "MY_WALLET_REQUEST") {
    return;
  }

  console.log("🟪 [Replay] 3. 收到 Index 消息，准备转发后台:", event.data);
  const { method, params, requestId } = event.data;

  try {
    // 发送给 Background
    chrome.runtime.sendMessage({
      method,
      params,
      requestId
    }, (response) => {
      // 检查底层连接错误 (关键!)
      if (chrome.runtime.lastError) {
        console.error("🟪 [Replay] ❌ 转发失败 (可能是插件重载了但页面没刷新):", chrome.runtime.lastError.message);
        // 尝试通知网页端报错
        window.postMessage({
          type: "MY_WALLET_RESPONSE",
          requestId,
          error: "Extension context invalidated. Please refresh the page."
        }, "*");
        return;
      }

      console.log("🟪 [Replay] 4. 收到 Background 响应:", response);

      // 转发回 Index
      window.postMessage({
        type: "MY_WALLET_RESPONSE",
        requestId,
        result: response?.result,
        error: response?.error,
      }, "*");
    });
  } catch (e) {
    console.error("🟪 [Replay] 发送异常:", e);
  }
})