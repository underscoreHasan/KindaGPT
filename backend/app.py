from flask import Flask, render_template
from flask_socketio import SocketIO, send
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")  # Enable real-time communication

@app.route("/")
def index():
    return "Server is running!"

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    if request.sid in users:
        print(f"User {request.sid} ({users[request.sid]['name']}) disconnected.")
        del users[request.sid]
        # Notify operators that the user left
        for op in operators:
            emit("user_left", {"user_id": request.sid}, room=op)
    elif request.sid in operators:
        print(f"Operator {request.sid} disconnected.")
        del operators[request.sid]

@socketio.on('set_role')
def set_role(data):
    if isinstance(data, dict) and data.get("role") == "user":
        user_name = data.get("name", "Anonymous")
        users[request.sid] = {"name": user_name}
        print(f"User {request.sid} ({user_name}) connected.")

        # Notify operators about the new user
        for op in operators:
            emit("new_user", {"user_id": request.sid, "user_name": user_name}, room=op)

    elif data == "operator":
        operators[request.sid] = "operator"
        print(f"Operator {request.sid} connected.")

@socketio.on('user_message')
def handle_user_message(data):
    message = data.get("text")
    user_id = request.sid
    user_name = users.get(user_id, {}).get("name", data.get("name", "Anonymous"))

    users[user_id] = {"name": user_name}  # Ensure the user is stored

    # Send message to all operators
    for op in operators:
        emit('server_message', {
            "text": message,
            "sender": "USER",
            "user_id": user_id,
            "user_name": user_name
        }, room=op)

    print(f"User {user_id} ({user_name}) sent a message: {message}")

@socketio.on('operator_message')
def handle_operator_message(data):
    message = data.get("text")
    target_user = data.get("user_id")

    if target_user in users:
        emit('server_message', {
            "text": message,
            "sender": "ParodyGPT"
        }, room=target_user)

@socketio.on('operator_typing')
def operator_typing(data):
    user_id = data.get("user_id")
    if user_id in users:
        emit('typing', {}, room=user_id)
@app.route("/receive_message", methods=["POST"])

def receive_message():
    data = request.json()
    print("Data from frontend: ", data)
    send_message(data)

@socketio.on("message")
def handle_message(msg):
    print(f"Message received: {msg}")
    send(msg, broadcast=True)  # Send message to all connected clients

def send_message(data):
    print("Sending message")

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
