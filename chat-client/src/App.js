import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://128.189.241.176:5000"); // Connect to Flask backend

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.send(message);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>React + Flask Chat</h2>
      <div style={{ border: "1px solid black", padding: 10, height: 300, overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        style={{ marginRight: 10 }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
