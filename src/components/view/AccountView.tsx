import { Button } from "~components/ui/button"
import { Page } from "~lib/types";
import { useWalletStore, type WalletAccount } from "~stores/walletStores"

interface AccountViewProps {
	accounts: WalletAccount[];
	setPage: (page: number) => void;
}

export const AccountView = ({ accounts, setPage}: AccountViewProps) => {
	const {createAccount, switchAccount, currentAccount} = useWalletStore();

	const handleSwitchAccount = (account: WalletAccount) => {
		//切换账户逻辑
		switchAccount(account.address);
		console.log("切换到账户：", account.name);

		setPage(Page.BalanceView);
	}

	const onCreateAccount = async () => {
		//创建新账户逻辑
		const password = prompt("请输入密码以创建新账户");
		if(password){
			//调用createAccount
			try {
				await createAccount(password);
				alert("新账户创建成功");
			}
			catch (error) {
				alert("创建失败，请检查密码");
			}
		}
	}

	return (
		<div>
			<Button onClick={onCreateAccount}>创建新账户</Button>
			{accounts.map(account => (
				<div key={account.address} className="p-2 border-b" onClick={()=>{
					handleSwitchAccount(account);
				}}>
					<div>Name: {account.name}</div>
					<div>Address: {account.address}</div>
				</div>
			))}

		</div>
	)
}