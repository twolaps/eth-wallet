import { useState, type ChangeEvent } from "react";
import { Button } from "~components/ui/button"
import { Input } from "~components/ui/input"

interface LoginViewProps {
	handleLogin: (password: string) => void;
}
export const LoginView = ({ handleLogin }: LoginViewProps) => {
	const [value, setValue] = useState<string>("");
	const onChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
		const value: string = e.target.value;
		setValue(value);
	}
	const onClickButton = () => {
		handleLogin(value);
	}

	return (
		<div className="flex flex-col gap-2 items-center">
			<h1>连接钱包</h1>
			<h1>请输入密码</h1>
			<Input type="password" placeholder="请输入密码" onChange={onChangePassword}/>
			<Button onClick={onClickButton}>确 定</Button>
		</div>
	)
}