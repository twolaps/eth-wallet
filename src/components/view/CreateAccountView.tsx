import { useState, type ChangeEvent } from "react";
import { Button } from "~components/ui/button"
import { Input } from "~components/ui/input"
import { Page } from "~lib/types";
import { useWalletStore } from "~stores/walletStores";

interface CreateAccountViewProps {
	setPage: (page: number) => void;
}

export const CreateAccountView = ({setPage}: CreateAccountViewProps) => {

	const [password, setPassword] = useState<string>("");
	const {createAccount} = useWalletStore();

	const onChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
		const value: string = e.target.value;
		setPassword(value);
	}

	const onClickCreateAccount = async () => {
		if (password.length < 8) {
			alert("密码长度不能少于8位");
			return;
		}

		try {
			await createAccount(password);
			setPassword("");
			alert("新账户创建成功");
			setPage(Page.BalanceView);
		}
		catch (error) {
			alert("创建失败，请检查密码");
		}
	}	

	return (
		<div className="flex flex-col gap-2 items-center">
			<h1>请输入密码以创建新账户</h1>
			<Input type="password" placeholder="请输入密码" value={password} onChange={onChangePassword}/>
			<Button onClick={onClickCreateAccount}>创建账户</Button>
		</div>
	)
}