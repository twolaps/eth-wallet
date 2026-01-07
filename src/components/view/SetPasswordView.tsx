import { useState, type ChangeEvent } from "react"
import { Button } from "~components/ui/button"
import { Input } from "~components/ui/input"

interface SetPasswordViewProps {
	handleSetupPassword: (password: string) => void;
}

export const SetPasswordView = ({ handleSetupPassword }: SetPasswordViewProps) => {

	const [password1, setPassword1] = useState<string>("");
	const [password2, setPassword2] = useState<string>("");


	const onChange1 = (e: ChangeEvent<HTMLInputElement>) =>{
		const value: string = e.target.value;
		setPassword1(value);
	}

	const onChange2 = (e: ChangeEvent<HTMLInputElement>) => {
		const value: string = e.target.value;
		setPassword2(value);
	}

	const onClickConfirm = async() => {
		if(password1.length < 8 || password2.length < 8){
			alert("密码长度不能少于8位");
			return;
		}
		else if(password1 !== password2){
			alert("两次输入的密码不一致");
			return;
		}
		else{
			alert("密码设置成功");
			await handleSetupPassword(password1);
		}
	}

	return (
		<div className="flex flex-col gap-2 items-center">
			<h1>设置密码</h1>
			<Input type="password" placeholder="请输入密码" onChange={onChange1}/>
			<Input type="password" placeholder="请再次输入密码" onChange={onChange2}/>
			<Button onClick={onClickConfirm}>确 定</Button>
		</div>
	)
}