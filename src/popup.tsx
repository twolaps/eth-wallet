import { useWalletStore } from "~stores/walletStores";
import "./globals.css"
import { useState, useEffect } from "react";
import { SetPasswordView } from "~components/view/SetPasswordView";
import { AccountView } from "~components/view/AccountView";
import { Page } from "~lib/types";
import { BalanceView } from "~components/view/BalanceView";
import { LoginView } from "~components/view/LoginView";
import { ImportedView } from "~components/view/ImportedView";
import { TransactView } from "~components/view/TransactView";
import { CreateAccountView } from "~components/view/CreateAccountView";
import { TxConfirm } from "~components/view/TxConfirm";
import { WalletEngine } from "~lib/wallet-engine";

function IndexPopup() {
  const [page, setPage] = useState<Page | null>(null);
  const [balance, setBalance] = useState<string>("0.0000");
  const [password, setPassword] = useState<string>("");

  const {
    mnemonic,
    accounts,
    currentAccount,
    createWallet,
    createAccount,
    importAccount,
    clearCurrentAccount,
    resetWallet,
    pendingTx,
    setPendingTx,
    getPrivateKey,
    _hasHydrated
  } = useWalletStore();

  // 1. 新增：监听来自后台的独立交易请求
  useEffect(() => {
    const checkPendingTransaction = async () => {
      const result = await chrome.storage.local.get("current-transaction");
      const tx = result["current-transaction"];
      
      // 如果存在状态为 pending 的交易，且 UI 当前没有正在处理的交易，加载它
      if (tx && tx.status === "pending") {
        console.log("Popup: 发现待处理交易", tx);
        setPendingTx(tx);
      }
    };

    if (_hasHydrated) {
      checkPendingTransaction();
    }
  }, [_hasHydrated, setPendingTx]);

  // 处理确认
  const handleConfirmTx = async (txPassword: string) => {
    if (!pendingTx) return;
    if (!txPassword) { alert("请输入密码"); return; }

    try {
      const privateKey = await getPrivateKey(txPassword);
      if (!privateKey) throw new Error("私钥获取失败，请检查密码");

      // UI更新为处理中
      setPendingTx({ ...pendingTx, status: 'pending' });

      // 发送交易
      const result = await WalletEngine.sendTransaction(privateKey, pendingTx.to, pendingTx.value);

      if (result.success && result.txHash) {
        // 关键修改：更新 current-transaction 通知后台
        await chrome.storage.local.set({
          "current-transaction": {
            ...pendingTx,
            status: "confirmed",
            txHash: result.txHash
          }
        });
        
        setPendingTx(null);
        alert(`交易成功！Hash: ${result.txHash}`);
      } else {
        // 通知后台失败
        await chrome.storage.local.set({
          "current-transaction": {
             ...pendingTx,
             status: "failed",
             error: result.error
          }
        });
        
        setPendingTx(null);
        alert(`交易失败：${result.error}`);
      }
    } catch (error: any) {
      // 通知后台报错
      await chrome.storage.local.set({
        "current-transaction": {
           ...pendingTx,
           status: "failed",
           error: error.message
        }
      });
      setPendingTx(null);
      alert(`错误：${error.message}`);
    }
  }

  // 处理取消
  const handleCancelTx = async () => {
    if (!pendingTx) return;

    // 关键修改：通知后台已取消
    await chrome.storage.local.set({
      "current-transaction": {
        ...pendingTx,
        status: "cancelled"
      }
    });

    setPendingTx(null);
  }

  // ---------------- 原有路由逻辑 ----------------
  
  const handleSetupPassword = async (pwd: string) => {
    if (!pwd || pwd.length < 8) { alert("密码需8位以上"); return; }
    try { await createWallet(pwd); } catch (e) { console.error(e); }
  }
  const handleLogin = async (pwd: string) => setPassword(pwd);
  const handlerImportAccount = async (pk: string, pwd: string, name: string) => {
    try { await importAccount(pk, pwd, name); alert("导入成功"); setPage(null); }
    catch (e: any) { alert(e.message); }
  }

  // Loading
  if (!_hasHydrated) {
    return <div className="p-4 flex items-center justify-center h-[500px]">Loading...</div>;
  }

  let contentJSX: JSX.Element = null;

  if (pendingTx) {
    contentJSX = <TxConfirm 
      pendingTx={pendingTx} 
      handleConfirmTx={handleConfirmTx} 
      handleCancel={handleCancelTx}
    />
  }
  else if (page === Page.ImportedView) contentJSX = <ImportedView setPage={setPage} importAccount={handlerImportAccount}/>
  else if (page === Page.CreateAccountView) contentJSX = <CreateAccountView setPage={setPage}/>
  else if (page === Page.TransactView) contentJSX = <TransactView setPage={setPage} balance={balance} setBalance={setBalance}/>
  else if (!mnemonic) contentJSX = <SetPasswordView handleSetupPassword={handleSetupPassword} />
  else if (mnemonic && accounts.length === 0) contentJSX = <LoginView handleLogin={handleLogin} />
  else if (mnemonic && accounts.length > 0 && currentAccount) {
    contentJSX = <BalanceView address={currentAccount.address} balance={balance} setBalance={setBalance} clearCurrentAccount={clearCurrentAccount} setPage={setPage} />
  }
  else contentJSX = <AccountView accounts={accounts} setPage={setPage}/>

  return <div className="p-4 w-[500px] h-[500px]">{contentJSX}</div>
}

export default IndexPopup