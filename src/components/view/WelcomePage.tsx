import { Button } from "~components/ui/button"
import { Page } from "~lib/types";

interface WelcomePageProps {
	setPage: (page: number) => void;
}
export const WelcomePage = ({ setPage }: WelcomePageProps) => {

	const onClickCreateNewWallet = () => {
		setPage(Page.SetPassword);
	}

	const onClickImport = () => {
		alert("导入钱包功能暂未实现");
	}

	return (
		<div className="flex flex-col gap-4 items-center">
			<Button onClick={onClickCreateNewWallet}>创建新钱包</Button>
			<Button onClick={onClickImport}>导入已有钱包</Button>
		</div>
	)
}