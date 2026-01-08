import { useState, type ChangeEvent } from "react";
import { Button } from "~components/ui/button"
import { Input } from "~components/ui/input"

interface ImportedViewProps {
	setPage: (page: number) => void;
	importAccount: (privateKey: string, password: string, name: string) => void;
}

export const ImportedView = ({ setPage, importAccount }: ImportedViewProps) => {
	const [privateKey, setPrivateKey] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [name, setName] = useState<string>("");

	const onChangePrivateKey = (e: ChangeEvent<HTMLInputElement>) => {
		const value: string = e.target.value;
		setPrivateKey(value);
	}

	const onChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
		const value: string = e.target.value;
		setPassword(value);
	}

	const onChangeName = (e: ChangeEvent<HTMLInputElement>) => {
		const value: string = e.target.value;
		setName(value);
	}

	const onClickImport = async () => {
		if (privateKey.length === 0) {
			alert("请输入私钥");
			return;
		}
		if (password.length === 0) {
			alert("请输入密码");
			return;
		}
		if (name.length === 0) {
			alert("请输入账户名称");
			return;
		}
		await importAccount(privateKey, password, name);

		setPrivateKey("");
		setPassword("");
		setName("");
	}

	return (
		<div className="flex flex-col gap-2 items-center">
			<Input type="password" placeholder="请输入私钥" value={privateKey} onChange={onChangePrivateKey}/>
			<Input type="password" placeholder="请输入密码" value={password} onChange={onChangePassword}/>
			<Input type="text" placeholder="请输入账户名称" value={name} onChange={onChangeName}/>
			<Button onClick={onClickImport}>导入账户</Button>
		</div>
	)
}