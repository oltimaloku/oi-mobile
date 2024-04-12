import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  View,
} from 'react-native';
import io, {Socket} from 'socket.io-client';

function App(): React.JSX.Element {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [initStatus, setInitStatus] = useState('Initializing');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messageBuffer, setMessageBuffer] = useState<string>('');

  useEffect(() => {
    const newSocket = io('http://localhost:8000');

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setInitStatus('Ready');
      setMessages(msgs => [...msgs, 'Connected to server']);
    });

    newSocket.on('status', data => {
      console.log('Status:', data.msg);
      if (data.msg === 'Ready') {
        setInitStatus('Ready');
        console.log('DATA:', JSON.stringify(data, null, 2));
        setMessages(msgs => [...msgs, `Status: ${data.msg}`]);
      }
    });

    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);

  const handleSubmit = () => {
    if (socket) {
      console.log('Sending command via WebSocket:', text);
      socket.emit('run_command', {command: text});
      setMessages(msgs => [...msgs, `You: ${text}`]);
      setText('');
    } else {
      Alert.alert('Error', 'Socket is not connected.');
    }
  };

  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]); // runs when `messages` changes

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>Interpreter Status: {initStatus}</Text>
        <View
          style={{
            width: 15,
            height: 15,
            borderRadius: 20,
            backgroundColor: initStatus === 'Ready' ? 'green' : 'red',
          }}
        />
      </View>
      <ScrollView style={styles.messageArea}>
        {messages.map((message, index) => (
          <Text key={index} style={styles.message}>
            {message}
          </Text>
        ))}
      </ScrollView>
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          onChangeText={setText}
          value={text}
          placeholder="Enter command"
        />
        <Button title="Submit" onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  statusText: {
    marginRight: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageArea: {
    flex: 1,
    padding: 10,
  },
  message: {
    marginBottom: 5,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    marginRight: 10,
    padding: 10,
    borderRadius: 20,
  },
});

export default App;
