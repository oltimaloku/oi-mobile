import React, {useState} from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';

function App(): React.JSX.Element {
  const [text, setText] = useState('');

  const handleSubmit = async () => {
    try {
      console.log('Sending command: ' + text);
      const response = await fetch('http://localhost:8000/run-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({command: text}),
      });
      console.log('Response:', response);
      const jsonResponse = await response.json();
      if (response.ok) {
        Alert.alert(
          'Success',
          'Command sent successfully: ' + jsonResponse.output,
        );
      } else {
        Alert.alert('Error', jsonResponse.error || 'Failed to send command');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while sending the command');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
