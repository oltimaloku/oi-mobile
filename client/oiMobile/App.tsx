import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  View,
} from 'react-native';
import io, {Socket} from 'socket.io-client';

function App(): React.JSX.Element {
  const [text, setText] = useState('');
  const [initStatus, setInitStatus] = useState('Initializing');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:8000');

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setInitStatus('Ready');
    });

    newSocket.on('status', data => {
      console.log('Status:', data.msg);
      if (data.msg === 'Ready') {
        setInitStatus('Ready');
      }
    });

    newSocket.on('response', data => {
      if (data.error) {
        Alert.alert('Error', data.error);
      } else {
        Alert.alert('Success', 'command executed: ' + data.output);
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
    } else {
      Alert.alert('Error', 'Socket is not connected.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={{marginLeft: 10}}>Interpreter Status: </Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text>{initStatus}</Text>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: initStatus === 'Ready' ? 'green' : 'red',
            }}
          />
        </View>
      </View>
      <TextInput
        style={styles.input}
        onChangeText={setText}
        value={text}
        placeholder="Enter command"
      />
      <Button title="Submit" onPress={handleSubmit} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Use the entire screen
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally\
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%', // Make input 80% of container width
  },
});

export default App;
