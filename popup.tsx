import { useState } from "react"
import "./globals.css"
import { Buffer } from "buffer"
import process from "process"
import { Button } from "~components/ui/button"

if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer
  window.process = process
}

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div className="p-4">
			<Button>asdf</Button>
    </div>
  )
}

export default IndexPopup
