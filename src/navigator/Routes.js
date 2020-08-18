import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from '../components/Login';
import Dashboard from '../components/Dashboard';
import Chat from '../components/Chat';

const Stack = createStackNavigator();

export default class Navigator extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName={this.props.isLogin ? "Dashboard" : "Login"}>
          <Stack.Screen name="Login" options={{ headerShown: false }} component={Login} />
          <Stack.Screen name="Dashboard" options={{ headerShown: false }} component={Dashboard} />
          <Stack.Screen name="Chat" options={{ headerShown: false }} component={Chat} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}