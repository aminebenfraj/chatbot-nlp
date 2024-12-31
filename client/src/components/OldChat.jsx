import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userMessage = { type: "user", content: input };
    setMessages([...messages, userMessage]);

    try {
      const response = await axios.post("http://localhost:5000/api/predict", {
        question: input,
      });

      const aiResponse = { type: "ai", content: response.data.response };
      setMessages([...messages, userMessage, aiResponse]);
    } catch (error) {
      const errorMessage = { type: "ai", content: "Error fetching response." };
      setMessages([...messages, userMessage, errorMessage]);
      console.error(error);
    }

    setInput("");
  };

  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto bg-zinc-700 shadow-lg rounded-lg overflow-hidden">
        <div className="bg-zinc-600 p-4 border-b">
          <h2 className="text-2xl font-bold text-center text-gray-100">
            Chat with AI
          </h2>
        </div>
        <div
          ref={chatBoxRef}
          className="h-[500px] overflow-y-auto p-4 space-y-4"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.type === "user" ? "bg-blue-500 ml-auto w-fit" : "bg-zinc-800"
              } max-w-[80%] ${
                msg.type === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`font-semibold ${
                  msg.type === "user" ? "text-zinc-700" : "text-gray-100"
                }`}
              >
                {msg.type === "user" ? "You:" : "AI:"}
              </div>
              {typeof msg.content === "string" ? (
                <p className="mt-1 text-white">{msg.content}</p>
              ) : (
                <div className="mt-2 text-gray-100">
                  <p>{msg.content.definition}</p>
                  <h4 className="font-semibold mt-2">Key Features:</h4>
                  <ul className="list-disc pl-5">
                    {msg.content.key_features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                  <h4 className="font-semibold mt-2">Best Used For:</h4>
                  <ul className="list-disc pl-5">
                    {msg.content.best_used_for.map((use, i) => (
                      <li key={i}>{use}</li>
                    ))}
                  </ul>
                  <h4 className="font-semibold mt-2">Popular Frameworks:</h4>
                  <ul className="list-disc pl-5">
                    {msg.content.popular_frameworks.map((framework, i) => (
                      <li key={i}>{framework}</li>
                    ))}
                  </ul>
                  <h4 className="font-semibold mt-2">
                    {msg.content.code_example.title}
                  </h4>
                  <SyntaxHighlighter
                    language="python"
                    style={materialDark}
                    className="text-sm mt-2 rounded-md"
                  >
                    {msg.content.code_example.code}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask your question..."
              className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
