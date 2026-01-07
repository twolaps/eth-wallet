import { Button } from "~components/ui/button"
import type { WalletAccount } from "~stores/walletStores"

interface AccountViewProps {
	accounts: WalletAccount[];
}

export const AccountView = ({ accounts }: AccountViewProps) => {
	const onClickAccount = (account: WalletAccount) => {
		//切换账户逻辑
		

	}

	return (
		<div>
			<Button>创建新账户</Button>
			{accounts.map(account => (
				<div key={account.address} className="p-2 border-b" onClick={()=>{
					onClickAccount(account);
				}}>
					<div>Name: {account.name}</div>
					<div>Address: {account.address}</div>
				</div>
			))}

		</div>
	)
}