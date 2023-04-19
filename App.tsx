import React from 'react';
import i18n from './src/i18n/_i18n';
import { color } from './src/assets/colors';
import { StoreProvider } from './src/store';
import { FirebaseProvider } from './src/db/index';
import firebase from '@react-native-firebase/app';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Image, LogBox, StyleSheet, Appearance, StatusBar } from 'react-native';

// Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import TextArea from './src/components/TextArea';
import SplashScreen from './src/screens/SplashScreen';

const MainStack = createStackNavigator();
const HomeStack = createStackNavigator();
const Tab = createBottomTabNavigator();

function App(): JSX.Element {
  LogBox.ignoreAllLogs();

  const MainStackOptions = {
    headerLeft: () => <></>,
    headerLeftLabelVisible: false,
    headerStyle: { backgroundColor: color('color2'), shadowOpacity: 0, elevation: 0, borderBottomWidth: 0, shadowColor: 'transparent' },
    headerTitleContainerStyle: styles.headerTitleContainerStyle,
    headerTitle: (props) => <Image style={styles.headerLogo} source={require('./src/assets/images/logo/header-default.png')} />
  };

  const TabNavigator = () => {
    return (
      <Tab.Navigator screenOptions={({ navigation, route }) => ({
        headerShown: false,
        safeAreaInsets: { top: 0 },
        title: i18n.t("route_" + route.name.replace('Stack', '')),
        tabBarActiveTintColor: color("color3"),
        tabBarInactiveTintColor: color("color8"),
        tabBarIcon: ({ focused, color, size }) => tabIcon(route, focused, color, size),
        tabBarStyle: [{ backgroundColor: color("color6"), borderTopWidth: Appearance.getColorScheme() === 'dark' ? 1 : 1, borderTopColor: color("color5") }],
      })}>
        <Tab.Screen name="HomeStack" component={HomeStackNavigator} />
        <Tab.Screen name="ProfileStack" component={HomeStackNavigator} />
      </Tab.Navigator>
    )
  }

  const HomeStackNavigator = () => {
    return (
      <HomeStack.Navigator screenOptions={({ navigation, route }) => ({
        headerShown: false,
      })}>
        <HomeStack.Screen name="Home" component={HomeScreen} />
      </HomeStack.Navigator>
    )
  }

  const tabIcon = (route, focused, _color, size) => {
    let iconName: string;
    switch (route.name.replace('Stack', '')) {
      case "Home": iconName = focused ? "ios-podium" : "ios-podium-outline"; break;
      case "Profile": iconName = focused ? "ios-person-circle" : "ios-person-circle-outline"; break;
    }
    // return <></>
    return <Ionicons name={iconName} size={size} color={focused ? color('color3') : _color} />
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle='light-content' />
      <FirebaseProvider>
        <StoreProvider>
          <MainStack.Navigator initialRouteName='Splash' screenOptions={({ navigation, route }) => (MainStackOptions)}>
            <MainStack.Screen name="Splash" component={SplashScreen} options={{ animationEnabled: false, headerShown: false }} />
            <MainStack.Screen name="Tab" component={TabNavigator} options={{ animationEnabled: true, presentation: "transparentModal" }} />
            <MainStack.Screen name="TextArea" component={TextArea} options={{ headerShown: false, animationEnabled: true, presentation: "modal", gestureEnabled: true }} />
          </MainStack.Navigator>
        </StoreProvider>
      </FirebaseProvider>
    </NavigationContainer>
  );
}

export default App;


const styles = StyleSheet.create({
  headerTitleContainerStyle: {
    left: 0,
    width: '100%',
    alignItems: 'center',
  },
  headerLogo: {
    height: 36,
    marginTop: -16,
    resizeMode: 'contain'
  }
});