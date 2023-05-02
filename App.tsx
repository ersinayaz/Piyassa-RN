import React from 'react';
import i18n from './src/i18n/_i18n';
import { color } from './src/assets/colors';
import { StoreProvider } from './src/store';
import { FirebaseProvider } from './src/db/index';
import firebase from '@react-native-firebase/app';
import useColorScheme from './src/assets/useColorScheme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Image, LogBox, StyleSheet, Appearance, StatusBar } from 'react-native';

// Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import TextArea from './src/components/TextArea';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SplashScreen from './src/screens/SplashScreen';
import PolicyScreen from './src/screens/PolicyScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ParityDetailScreen from './src/screens/ParityDetailScreen';
import DeleteAccountScreen from './src/screens/DeleteAccountScreen';

const MainStack = createStackNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Tab = createBottomTabNavigator();

function App(): JSX.Element {
  LogBox.ignoreAllLogs();
  const colorScheme = useColorScheme();

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
        <Tab.Screen name="ProfileStack" component={ProfileStackNavigator} />
      </Tab.Navigator>
    )
  }

  const HomeStackNavigator = () => {
    return (
      <HomeStack.Navigator screenOptions={({ navigation, route }) => ({
        animationEnabled: false,
        safeAreaInsets: { top: 0 },
        title: i18n.t("route_" + route.name),
        headerStyle: { backgroundColor: color('color2'), shadowOpacity: 0, elevation: 0, borderBottomWidth: 0, shadowColor: 'transparent' },
        headerTitleContainerStyle: styles.headerTitleContainerStyle,
        headerLeftContainerStyle: { zIndex: 2 },
        headerRightContainerStyle: { zIndex: 2 },
        headerTitle: (props) => <Image style={styles.headerLogo} source={require('./src/assets/images/logo/header-default.png')} />,
      })}>
        <HomeStack.Screen name="Home" component={HomeScreen} />
        <HomeStack.Screen name="ParityDetail" component={ParityDetailScreen} />
      </HomeStack.Navigator>
    )
  }

  const ProfileStackNavigator = () => {
    return (
      <ProfileStack.Navigator screenOptions={({ navigation, route }) => ({
        animationEnabled: false,
        safeAreaInsets: { top: 0 },
        headerLeftLabelVisible: false,
        title: i18n.t("route_" + route.name),
        headerStyle: { backgroundColor: color('color2'), shadowOpacity: 0, elevation: 0, borderBottomWidth: 0, shadowColor: 'transparent' },
        headerTitleContainerStyle: styles.headerTitleContainerStyle,
        headerLeftContainerStyle: { zIndex: 2 },
        headerRightContainerStyle: { zIndex: 2 },
        headerTitle: (props) => <Image style={styles.headerLogo} source={require('./src/assets/images/logo/header-default.png')} />,
      })}>
        <ProfileStack.Screen name="Profile" component={ProfileScreen} />
        <ProfileStack.Screen name="Settings" component={SettingsScreen} />
        <ProfileStack.Screen name="Policy" component={PolicyScreen} options={{ animationEnabled: true, presentation: "card", gestureEnabled: true }} />
        <ProfileStack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ animationEnabled: true, presentation: "card", gestureEnabled: true }} />
      </ProfileStack.Navigator>
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
          <MainStack.Navigator initialRouteName='Splash' screenOptions={({ navigation, route }) => ({ headerShown: false })}>
            <MainStack.Screen name="Splash" component={SplashScreen} options={{ animationEnabled: false, headerShown: false }} />
            <MainStack.Screen name="Tab" component={TabNavigator} options={{ animationEnabled: true, presentation: "transparentModal" }} />
            <MainStack.Screen name="TextArea" component={TextArea} options={{ headerShown: false, animationEnabled: true, presentation: "modal", gestureEnabled: true }} />
            <MainStack.Screen name="Login" component={LoginScreen} options={{ animationEnabled: true, presentation: "modal", gestureEnabled: false, headerShown: false }} />
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
    maxWidth: '50%',
    alignItems: 'center',
  },
  headerLogo: {
    height: 36,
    marginTop: -16,
    resizeMode: 'contain'
  }
});