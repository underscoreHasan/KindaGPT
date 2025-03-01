import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("128.189.241.176:5000"); // Connect to Flask backend

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
      // socket.emit("user_message", { text: message, name });
      // setMessages((prev) => [...prev, { text: message, sender: "Me" }]);
      socket.send(message);
      setMessage("");
    }
  };

  const sendOperatorMessage = () => {
    if (message.trim() && selectedUser) {
      // socket.emit("operator_message", { text: message, user_id: selectedUser.id });
      // setMessages((prev) => [...prev, { text: message, sender: "ParodyGPT" }]);
      socket.send(message);
      setMessage("");
    }
  };

  const handleOperatorTyping = () => {
    if (selectedUser) {
      socket.emit("operator_typing", { user_id: selectedUser.id });
    }
  };

  const handleKeyPress = (e, sendFunction) => {
    if (e.key === "Enter") {
      sendFunction();
    }
  };

  if (role === "user" && !name) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>Enter Your Name</h2>
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          placeholder="Your name..."
        />
        <button onClick={handleSetUserName} disabled={!tempName.trim()}>Start Chat</button>
      </div>
    );
  }

  if (!role) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>Select Your Role</h2>
        <button onClick={() => handleSetRole("user")} style={{ marginRight: 10 }}>User</button>
        <button onClick={() => handleSetRole("operator")}>Operator</button>
      </div>
    );
  }

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