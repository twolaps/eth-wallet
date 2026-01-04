import { useState } from "react"
import { Button } from "~components/ui/button"

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div>
			<Button className="w-full">Click me</Button>
    </div>
  )
}

export default IndexPopup
