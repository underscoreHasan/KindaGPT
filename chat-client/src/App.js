// import React, { useState, useEffect } from "react";
// import io from "socket.io-client";

// const socket = io("http://127.0.0.1:5000"); // Connect to Flask backend

// function App() {
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);

//   useEffect(() => {
//     socket.on("message", (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     return () => {
//       socket.off("message");
//     };
//   }, []);

//   const sendMessage = () => {
//     if (message.trim()) {
//       socket.send(message);
//       setMessage("");
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>React + Flask Chat</h2>
//       <div style={{ border: "1px solid black", padding: 10, height: 300, overflowY: "auto" }}>
//         {messages.map((msg, index) => (
//           <p key={index}>{msg}</p>
//         ))}
//       </div>
//       <input
//         type="text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         placeholder="Type a message..."
//         style={{ marginRight: 10 }}
//       />
//       <button onClick={sendMessage}>Send</button>
//     </div>
//   );
// }

// export default App;
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://128.189.241.176:5000"); // Connect to Flask backend

function App() {
  const [role, setRole] = useState(null);
  const [tempName, setTempName] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    socket.on("server_message", (data) => {
      setMessages((prev) => [...prev, data]);

      if (data.sender === "USER" && data.user_id && data.user_name) {
        setActiveUsers((prev) => {
          const exists = prev.some((u) => u.id === data.user_id);
          return exists ? prev : [...prev, { id: data.user_id, name: data.user_name }];
        });
      }
    });

    socket.on("new_user", (data) => {
      setActiveUsers((prev) => {
        const exists = prev.some((u) => u.id === data.user_id);
        return exists ? prev : [...prev, { id: data.user_id, name: data.user_name }];
      });
    });

    socket.on("user_left", (data) => {
      setActiveUsers((prev) => prev.filter((user) => user.id !== data.user_id));
    });

    socket.on("typing", () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    });

    return () => {
      socket.off("server_message");
      socket.off("new_user");
      socket.off("user_left");
      socket.off("typing");
    };
  }, []);

  const handleSetRole = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === "operator") {
      socket.emit("set_role", "operator");
    }
  };

  const handleSetUserName = () => {
    if (tempName.trim()) {
      setName(tempName);
      socket.emit("set_role", { role: "user", name: tempName });
    }
  };

  const sendUserMessage = () => {
    if (message.trim()) {
      socket.emit("user_message", { text: message, name });
      setMessages((prev) => [...prev, { text: message, sender: "Me" }]);
      setMessage("");
    }
  };

  const sendOperatorMessage = () => {
    if (message.trim() && selectedUser) {
      socket.emit("operator_message", { text: message, user_id: selectedUser.id });
      setMessages((prev) => [...prev, { text: message, sender: "ParodyGPT" }]);
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
      <h2>{role === "user" ? `Chat with ParodyGPT (${name})` : "Operator Panel"}</h2>

      <div style={{ border: "1px solid black", padding: 10, height: 300, overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.sender}:</strong> {msg.text}
            {msg.sender === "USER" && msg.user_name && ` (${msg.user_name})`}
          </p>
        ))}
        {typing && <p><em>ParodyGPT is typing...</em></p>}
      </div>

      {role === "operator" && activeUsers.length > 0 && (
        <div>
          <h4>Active Users:</h4>
          {activeUsers.map((user) => (
            <button key={user.id} onClick={() => setSelectedUser(user)} style={{ margin: "5px" }}>
              {selectedUser?.id === user.id ? `Replying to ${user.name}` : user.name}
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => handleKeyPress(e, role === "user" ? sendUserMessage : sendOperatorMessage)}
      />
      <button onClick={role === "user" ? sendUserMessage : sendOperatorMessage} disabled={!selectedUser && role === "operator"}>
        Send
      </button>
    </div>
  );
}

export default App;
