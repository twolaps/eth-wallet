import { Storage } from "@plasmohq/storage";

const storage = new Storage();

// 用来暂存待处理请求的 sendResponse 回调函数
// Key: requestId, Value: sendResponse function
const pendingRequests = new Map<string, (response: any) => void>();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 1. 处理连接钱包的逻辑
  if (message.method === "eth_requestAccounts") {
    handleConnect(sendResponse);
    return true;
  }
  // 2. 处理获取链ID请求
  else if (message.method === "eth_chainId") {
    sendResponse({ result: "0xaa36a7" }); // Sepolia Testnet
    return true;
  }
  // 3. 处理发送交易请求
  else if (message.method === "eth_sendTransaction") {
    const txParams = message.params[0];

    // 保存 sendResponse，以便稍后在监听器中调用
    pendingRequests.set(message.requestId, sendResponse);

    const handleAsync = async () => {
      try {
        // 将交易存入 storage, 通知 Popup 显示确认界面
        await handlePendingTx(txParams, message.requestId);

        // 主动弹窗
        await openConfirmationWindow();

        // 注意：这里不要调用 sendResponse，也不要 delete pendingRequests
        // 我们在下方的 storage.onChanged 中处理回复
      } catch (error) {
        console.error("处理交易请求失败:", error);
        // 如果启动阶段就出错了，直接返回错误并清理 Map
        sendResponse({ error: error.message });
        pendingRequests.delete(message.requestId);
      }
    };

    handleAsync();
    return true; // 保持消息通道开启
  }
});

// 核心补充：监听 Storage 变化，捕获 Popup 的处理结果
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes["wallet-storage"]) {
    const newValue = JSON.parse(changes["wallet-storage"].newValue || "{}");
    const pendingTx = newValue.state?.pendingTx;

    // 如果 storage 中有 pendingTx，且状态已经是终态（confirmed/failed/cancelled）
    if (pendingTx && pendingTx.requestId && pendingRequests.has(pendingTx.requestId)) {
      
      const sendResponse = pendingRequests.get(pendingTx.requestId);

      if (pendingTx.status === "confirmed") {
        console.log("检测到交易成功，返回 Hash:", pendingTx.txHash);
        sendResponse({ result: pendingTx.txHash });
        pendingRequests.delete(pendingTx.requestId);
      } 
      else if (pendingTx.status === "failed") {
        console.log("检测到交易失败:", pendingTx.error);
        sendResponse({ error: pendingTx.error || "Transaction failed" });
        pendingRequests.delete(pendingTx.requestId);
      } 
      else if (pendingTx.status === "cancelled") {
        console.log("用户取消了交易");
        sendResponse({ error: "User rejected the transaction" });
        pendingRequests.delete(pendingTx.requestId);
      }
      // 如果状态是 pending，说明用户正在输入密码，不做处理，继续等待
    }
  }
});

async function openConfirmationWindow() {
  const width = 360;
  const height = 600;

  await chrome.windows.create({
    url: "popup.html", 
    type: "popup",
    width: width,
    height: height,
    focused: true
  });
}

async function handlePendingTx(params: any, requestId: string) {
  const storageData = await chrome.storage.local.get("wallet-storage");

  // 构造默认结构，防止 storage 为空时报错
  let data = storageData["wallet-storage"]
    ? JSON.parse(storageData["wallet-storage"])
    : { state: { accounts: [] } };

  // 确保 state 对象存在
  if (!data.state) data.state = {};

  data.state.pendingTx = {
    to: params.to,
    value: params.value,
    requestId: requestId,
    status: "pending" // 初始状态
  };

  await chrome.storage.local.set({
    "wallet-storage": JSON.stringify(data),
  });
}

async function handleConnect(sendResponse: (response?: any) => void) {
  try {
    const wallet = await storage.get<any>("wallet");
    if (wallet && wallet.address) {
      console.log("DApp 已连接到地址:", wallet.address);
      sendResponse({ result: [wallet.address] });
    } else {
      sendResponse({
        error: {
          code: 4001,
          message: "用户未初始化钱包，请先在插件中创建或导入账户",
        }
      });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}