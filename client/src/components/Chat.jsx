import React, { useState, useRef, useEffect } from "react"
import axios from "axios"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism"

function Typewriter({ text, speed = 20 }) {
  const [displayText, setDisplayText] = useState("")
  const index = useRef(0)

  useEffect(() => {
    const timer = setInterval(() => {
      if (index.current < text.length) {
        setDisplayText((prev) => prev + text.charAt(index.current))
        index.current += 1
      } else {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return <span>{displayText}</span>
}

function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { type: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await axios.post("http://localhost:5000/api/predict", {
        question: input,
      })
      console.log(response.data);
      
      const aiResponse = response.data.response
      setMessages((prev) => [...prev, { type: "ai", content: aiResponse }])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: "ai", content: "Error fetching response." },
      ])
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="container mx-auto h-[90vh] bg-gray-800 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Chat with AI</h2>
        <div className="w-full h-[calc(90vh-180px)] overflow-y-auto border border-gray-700 rounded-lg p-4 bg-gray-900 mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 ${
                msg.type === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block max-w-[70%] p-3 rounded-lg ${
                  msg.type === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                <div className="font-semibold mb-1 text-sm">
                  {msg.type === "user" ? "You:" : "AI:"}
                </div>
                {typeof msg.content === "string" ? (
                  msg.type === "ai" ? (
                    <Typewriter text={msg.content} speed={20} />
                  ) : (
                    <span>{msg.content}</span>
                  )
                ) : (
                  <div>
                    {msg.content.type === "definition" && (
                      <p className="mb-2">{msg.content.content}</p>
                    )}
                    {msg.content.type === "key_features" && (
                      <>
                        <h4 className="font-semibold mt-2">Key Features:</h4>
                        <ul className="list-disc list-inside">
                          {msg.content.map((feature, i) => (
                            <li key={i}>{feature}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {msg.content.type === "frameworks" && (
                      <>
                        <h4 className="font-semibold mt-2">Popular Frameworks:</h4>
                        <ul className="list-disc list-inside">
                          {msg.content.content.map(item => 
                            <li>{item}</li>
                          )}
                        </ul>
                      </>
                    )}
                    {msg.content.type === "use_cases" && (
                      <>
                        <h4 className="font-semibold mt-2">Best Used For:</h4>
                        <ul className="list-disc list-inside">
                          {msg.content.content.map((use, i) => (
                            <li key={i}>{use}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {msg.content.type === "code_example" && (
                      <>
                        <h4 className="font-semibold mt-2">{msg.content.content.title}</h4>
                        <SyntaxHighlighter
                          language="javascript"
                          style={materialDark}
                          className="rounded-lg text-sm mt-2"
                        >
                          {msg.content.content.code}
                        </SyntaxHighlighter>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask your question..."
            className="flex-1 p-3 rounded-l-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-3 bg-blue-600 hover:bg-blue-700 rounded-r-lg text-white font-semibold transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat

