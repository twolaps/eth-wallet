// src/background.ts

const pendingRequests = new Map<string, (response: any) => void>();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("🟧 [Background] 收到消息:", message.method, "ID:", message.requestId);

  const handleMessage = async () => {
    try {
      if (message.method === "eth_requestAccounts") {
        await handleConnect(sendResponse);
      } else if (message.method === "eth_chainId") {
        sendResponse({ result: "0xaa36a7" }); // Sepolia
      } else if (message.method === "eth_sendTransaction") {
        const txParams = message.params[0];
        // 1. 保存回调
        pendingRequests.set(message.requestId, sendResponse);
        
        // 2. 写入独立的交易请求存储区 (不碰 wallet-storage)
        await chrome.storage.local.set({
          "current-transaction": {
            to: txParams.to,
            value: txParams.value,
            requestId: message.requestId,
            status: "pending",
            timestamp: Date.now()
          }
        });
        
        // 3. 打开窗口
        await openConfirmationWindow();
      } else {
        console.warn("未处理的方法:", message.method);
      }
    } catch (error) {
      console.error("处理错误:", error);
      sendResponse({ error: error.message });
      pendingRequests.delete(message.requestId);
    }
  };

  handleMessage();
  return true;
});

// 监听 "current-transaction" 变化，而不是 wallet-storage
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes["current-transaction"]) {
    const newVal = changes["current-transaction"].newValue;
    if (!newVal) return;

    // 检查是否有对应的等待请求
    if (newVal.requestId && pendingRequests.has(newVal.requestId)) {
      const sendResponse = pendingRequests.get(newVal.requestId);

      if (newVal.status === "confirmed") {
        console.log("✅ 交易已确认，Hash:", newVal.txHash);
        sendResponse({ result: newVal.txHash });
        pendingRequests.delete(newVal.requestId);
        // 清理存储
        chrome.storage.local.remove("current-transaction");
      } else if (newVal.status === "failed") {
        console.log("❌ 交易失败:", newVal.error);
        sendResponse({ error: newVal.error });
        pendingRequests.delete(newVal.requestId);
        chrome.storage.local.remove("current-transaction");
      } else if (newVal.status === "cancelled") {
        console.log("🚫 用户取消");
        sendResponse({ error: "User rejected the transaction" });
        pendingRequests.delete(newVal.requestId);
        chrome.storage.local.remove("current-transaction");
      }
    }
  }
});

async function handleConnect(sendResponse) {
  // 只读操作，安全读取
  const result = await chrome.storage.local.get("wallet-storage");
  let data: any = {};
  
  try {
    const raw = result["wallet-storage"];
    if (typeof raw === "string") data = JSON.parse(raw);
    else if (raw) data = raw;
  } catch (e) { console.error("读取钱包数据失败", e); }

  const accounts = data?.state?.accounts || [];
  if (accounts.length > 0) {
    const address = data?.state?.currentAccount?.address || accounts[0].address;
    sendResponse({ result: [address] });
  } else {
    sendResponse({ error: { code: 4001, message: "请先创建钱包" } });
  }
}

async function openConfirmationWindow() {
  try {
    await chrome.windows.create({
      url: "popup.html",
      type: "popup",
      width: 500,
      height: 600,
      focused: true
    });
  } catch (e) {
    console.error("打开窗口失败:", e);
  }
}