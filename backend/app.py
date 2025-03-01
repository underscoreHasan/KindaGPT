from flask import Flask, render_template
from flask_socketio import SocketIO, send
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")  # Enable real-time communication

@app.route("/")
def index():
    return render_template("index.html")

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
