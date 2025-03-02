# from flask import Flask, render_template
# from flask_socketio import SocketIO, send
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)
# socketio = SocketIO(app, cors_allowed_origins="*")  # Enable real-time communication

# @app.route("/")
# def index():
#     return render_template("index.html")

# @app.route("/receive_message", methods=["POST"])

# def receive_message():
#     data = request.json()
#     print("Data from frontend: ", data)
#     send_message(data)

# @socketio.on("message")
# def handle_message(msg):
#     print(f"Message received: {msg}")
#     send(msg, broadcast=True)  # Send message to all connected clients

# def send_message(data):
#     print("Sending message")

# if __name__ == "__main__":
#     socketio.run(app, host='0.0.0.0', port=5000, debug=True)

# FILE: app.py

import os
import openai
from flask import Flask, request, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Set your OpenAI API key here (or load from environment)
# IMPORTANT: Make sure you have a valid key or calls to GPT will fail.
openai.api_key = os.environ.get("OPENAI_API_KEY")

# Keep track of user sessions
operators = set()
users = set()

# In-memory store: { user_sid: { 'prompt': str, 'gpt_response': str } }
pending_chats = {}
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Set your OpenAI API key here (or load from environment)
# IMPORTANT: Make sure you have a valid key or calls to GPT will fail.
openai.api_key = os.environ.get("OPENAI_API_KEY")

# Keep track of user sessions
operators = set()
users = set()

# In-memory store: { user_sid: { 'prompt': str, 'gpt_response': str } }
pending_chats = {}

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on('connect')
def handle_connect():
    print("Client connected:", request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    if sid in operators:
        operators.remove(sid)
        print("Operator disconnected:", sid)
    elif sid in users:
        users.remove(sid)
        print("User disconnected:", sid)

    # Clean up any pending data
    if sid in pending_chats:
        del pending_chats[sid]

@socketio.on('set_role')
def set_role(role):
    """
    The client (user or operator) tells us their role.
    """
    if role == "operator":
        operators.add(request.sid)
        print("Operator connected:", request.sid)
    else:
        users.add(request.sid)
        print("User connected:", request.sid)

@socketio.on('user_message')
def handle_user_message(data):
    """
    1. User sends prompt
    2. We call ChatGPT in the background
    3. Store GPT response in memory
    4. Forward the user's prompt to all operators
    """
    user_sid = request.sid
    prompt = data.get("text", "")

    # Get GPT's response
    gpt_resp = fetch_gpt_response(prompt)

    # Store in memory
    pending_chats[user_sid] = {
        "prompt": prompt,
        "gpt_response": gpt_resp
    }

    print(f"[USER] {user_sid} -> Prompt: {prompt[:50]}...")
    print(f"[GPT] Response saved (first 60 chars): {gpt_resp[:60]}...")

    # Forward prompt to all operators
    for op in operators:
        emit("server_message", {
            "sender": "USER",
            "user_id": user_sid,
            "text": prompt
        }, room=op)

@socketio.on('operator_message')
def handle_operator_message(data):
    """
    Operator responded to a user prompt. Let's compare operator's response with GPT's response.
    Then:
    1) Send feedback to operator
    2) Send operator's response to user
    """
    operator_sid = request.sid
    user_id = data.get("user_id")
    operator_resp = data.get("text", "")

    if user_id in pending_chats:
        stored_info = pending_chats[user_id]
        gpt_resp = stored_info["gpt_response"]

        # Build feedback
        feedback = get_comparison_feedback(gpt_resp, operator_resp)

        # 1) Show feedback to operator only
        # Pass GPT's text and operator's text so they can be displayed side-by-side
        emit("feedback", {
            "feedback": feedback,
            "gpt_text": gpt_resp,
            "operator_text": operator_resp
        }, room=operator_sid)

        # 2) Send operator's final text to user
        emit("server_message", {
            "sender": "ParodyGPT",  # user sees it as "AI"
            "text": operator_resp
        }, room=user_id)

        print(f"[OPERATOR] {operator_sid} responded to user {user_id}.")
        print(f"Feedback: {feedback[:60]}...")

    else:
        print("No stored GPT data for user_id:", user_id)

@socketio.on('operator_typing')
def handle_operator_typing(data):
    """
    Let the user know that the operator is typing.
    """
    user_id = data.get("user_id")
    if user_id in users:
        emit("typing", {}, room=user_id)

def fetch_gpt_response(prompt):
    """
    Call OpenAI to get a GPT response for the user's prompt.
    """
    try:
        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.7
        )
        return completion["choices"][0]["message"]["content"]
    except Exception as e:
        print("Error calling GPT:", e)
        return "Error: unable to retrieve GPT response."

def get_comparison_feedback(gpt_resp, operator_resp):
    """
    Compares GPT's response to operator's response.
    Asks GPT to produce short suggestions & a score out of 10.
    """
    compare_prompt = f"""
    Compare these two responses to the same user prompt:

    1) ChatGPT's response:
    {gpt_resp}

    2) Human's response:
    {operator_resp}

    Please provide a brief critique of how (2) could be improved in relation to (1), 
    and give it a score out of 10. Only provide a few suggestions (not a long critique).
    """

    try:
        comp = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": compare_prompt}],
            max_tokens=200,
            temperature=0.7
        )
        return comp["choices"][0]["message"]["content"]
    except Exception as e:
        print("Error comparing responses:", e)
        return "Feedback generation error."

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
