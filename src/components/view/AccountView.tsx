import { Button } from "~components/ui/button"
import { Page } from "~lib/types";
import { useWalletStore, type WalletAccount } from "~stores/walletStores"

interface AccountViewProps {
	accounts: WalletAccount[];
	setPage: (page: number) => void;
}

export const AccountView = ({ accounts, setPage}: AccountViewProps) => {
	const {switchAccount} = useWalletStore();

	const handleSwitchAccount = (account: WalletAccount) => {
		//切换账户逻辑
		switchAccount(account.address);
		console.log("切换到账户：", account.name);

		setPage(Page.BalanceView);
	}

	const onCreateAccount = async () => {
		setPage(Page.CreateAccountView);
	}

	const onImportAccount = async () => {
		setPage(Page.ImportedView);
	}

	return (
		<div className="gap-2 flex flex-col">
			<Button onClick={onCreateAccount}>创建新账户</Button>
			<Button onClick={onImportAccount}>导入账户</Button>
			{accounts.map(account => (
				<div key={account.address} className="p-2 border border-gray-700 rounded-md cursor-pointer" onClick={()=>{
        handleSwitchAccount(account);
      }}>
        <div>Name: {account.name}</div>
        <div>Address: {account.address}</div>
      </div>
    ))}
  </div>
);
};