import { useState } from "react"
import "./globals.css"
import { Button } from "~/components/ui/button"

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div>
			<Button className="w-full">Click me111</Button>
    </div>
  )
}

export default IndexPopup
