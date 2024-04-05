from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
import pexpect
import os

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

interpreter_instance = None

def init_interpreter():
    print("Spawning interpreter...")
    interpreter = pexpect.spawn('interpreter -y', encoding='utf-8', timeout=10)
    return interpreter

@socketio.on('connect')
def handle_connect():
    global interpreter_instance
    print('Client connected')
    if not interpreter_instance or interpreter_instance.terminated:
        interpreter_instance = init_interpreter()
    emit('status', {'msg': 'Interpreter initialized'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('run_command')
def handle_command(data):
    global interpreter_instance
    command = data.get('command')
    if not command:
        emit('response', {'error': 'No command provided'})
        return
    
    if not interpreter_instance or interpreter_instance.terminated:
        interpreter_instance = init_interpreter()

    try:
        print(f"Executing command: {command}")
        interpreter_instance.sendline(command)
        interpreter_instance.expect('> ')  # Adjust based on your interpreter's prompt
        response = interpreter_instance.before
        emit('response', {'output': response})
    except Exception as e:
        print(f"Error: {e}")
        emit('response', {'error': str(e)})

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=8000)
