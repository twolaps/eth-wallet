import { Button } from "~components/ui/button"
import { Input } from "~components/ui/input"

export const SetPasswordView = () => {


	
	
	return (
		<div className="flex flex-col gap-2 items-center">
			<h1>设置密码</h1>
			<Input type="password" placeholder="请输入密码"/>
			<Input type="password" placeholder="请再次输入密码"/>
			<Button>确 定</Button>
		</div>
	)
}