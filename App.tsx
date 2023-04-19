import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function App(): JSX.Element {

  return (
    <View style={styles.container}>
      <Text>Piyassa</Text>
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});