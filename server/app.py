from flask import Flask, request, jsonify
import subprocess
import pexpect
import shlex
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app) 

@app.route('/run-command', methods=['POST'])
def run_command():
    data = request.json
    command = data.get("command")
    
    if not command:
        return jsonify({"error": "No command provided"}), 400
    
    # Here, add the logic to interact with your interpreter shell
    # This is a placeholder for where you'd add your specific logic
    output = execute_interpreter_command(command)
    
    return jsonify({"output": output})

@app.route('/launch-interpreter', methods=['POST'])
def launch_interpreter():
    init_interpreter()
    return jsonify({"message": "Interpreter launched"})

def init_interpreter():
    child = pexpect.spawn('interpreter -y', encoding='utf-8')
    print("1 - Spawned interpreter")

def execute_interpreter_command(command):
    # Hardcoded API key
    openai_api_key = os.getenv('OPENAI_API_KEY')
    
    child = pexpect.spawn('interpreter -y', encoding='utf-8')
    print("1 - Spawned interpreter")
    
    # child.expect('OpenAI API key:')  # Wait for the API key prompt
    # print("2 - API key prompt detected")
    
    # child.sendline(openai_api_key)  # Provide the hardcoded API key
    # print("3 - Sent API key")
    
    child.expect('> ', timeout=10)  # Wait for the command prompt
    print("4 - Command prompt detected")
    
    child.sendline(command)  # Send the command
    print("5 - Command sent")

    # After sending the command, we try to capture the next prompt or any other indicator that the command has executed.
    try:
        child.expect('> ', timeout=10) 
        print("6 - Command execution detected")
    except pexpect.TIMEOUT:
        print("6 - Timeout waiting after command execution")
    
    print("Response after command execution:")
    print(child.before) 

    return child.before

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
