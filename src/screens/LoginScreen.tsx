import i18n from '../i18n/_i18n';
import { useStore } from '../store';
import { useFirestore } from '../db';
import { User } from '../models/User';
import { color } from '../assets/colors';
import packageJson from '../../package.json';
import auth from '@react-native-firebase/auth';
import React, { useState, useEffect } from 'react';
import * as RNLocalize from "react-native-localize";
import useColorScheme from '../assets/useColorScheme';
import messaging from '@react-native-firebase/messaging';
import analytics from '@react-native-firebase/analytics';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Platform, Appearance, ImageBackground } from 'react-native';
GoogleSignin.configure({ webClientId: '478607830477-79q1nbj9nqdcvhqpi1i8ll7jq32g3uu0.apps.googleusercontent.com', scopes: ['email', 'profile'] });
var facebookAccessToken = '';

const LoginScreen = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false);
    const { userStore, deviceStore } = useStore();
    const { users } = useFirestore();
    const colorScheme = useColorScheme();
    const darkMode = Appearance.getColorScheme() === 'dark';
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: color('color6'),
        },
        image: {
            flex: 1,
            width: "100%",
            resizeMode: 'contain',
        },
        form: {
            flex: 0,
            padding: 16,
        },
        text: {
            textAlign: "center"
        },
        txtTitle: {
            fontSize: 22,
            fontWeight: "bold",
            color: color("color8")
        },
        txtDescription: {
            padding: 20,
            fontSize: 14,
            lineHeight: 21,
            color: color("color7")
        },
        btnSocial: {
            height: 50,
            justifyContent: "center",
        },
        back: {
            top: 16,
            right: 16,
            width: 36,
            zIndex: 2,
            height: 36,
            padding: 5,
            borderRadius: 36,
            alignItems: "center",
            position: "absolute",
            justifyContent: "center",
            backgroundColor: color("color5"),
        },
        socialIcon: {
            width: 50,
            resizeMode: 'contain',
        },
        logo: {
            marginTop: -20,
            width: 145,
            resizeMode: 'contain'
        },
        socialButtons:
        {
            paddingBottom: 30,
            flexDirection: "row",
            justifyContent: "space-evenly"
        },
        activityIndicator: {
            flex: 1,
            zIndex: 9999,
            width: "100%",
            height: "100%",
            position: "absolute",
            backgroundColor: "#00000090"
        }
    });

    const goBack = () => {
        if (route.params?.from != null) {
            if (route.params?.from == "Profile" && userStore.me == null) {
                try {
                    navigation.reset({ index: 0, routes: [{ name: 'Tab'}] });
                    navigation.navigate("Home");
                } catch (error) {
                    console.error("er");
                }
                return;
            }
            navigation.navigate(route.params?.from, { data: route.params.parity });
        }
        else {
            navigation.navigate("Home");
            return;
        }
    }

    const getFacebookProfilePicture = async (userId) => {
        const response = await fetch(`https://graph.facebook.com/${userId}/picture?access_token=${facebookAccessToken}&redirect=false&height=400`);
        const json = await response.json();
        return json.data.url;
    }

    const getNotificationToken = async () => {
        const notificationStatus = await messaging().hasPermission();
        let notificationToken = '';

        if (notificationStatus === messaging.AuthorizationStatus.AUTHORIZED || notificationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
            notificationToken = await messaging().getToken();
        }

        if (Platform.OS === 'ios') {
            await messaging().setAutoInitEnabled(true);
        }

        await messaging().onTokenRefresh(async (token) => {
            notificationToken = token;
        }
        );
        return notificationToken;
    }

    const socialLogin = async (name) => {
        await analytics().logEvent('login_press', { provider: name });
        setLoading(true);
        switch (name) {
            case "google.com": await onGoogleButtonPress(); break;
            case "apple.com": await onAppleButtonPress(); break;
            case "facebook.com": await onFacebookButtonPress(); break;
        }
    }

    const errorHandling = async (provider, error) => {
        console.error(provider, error);
        setLoading(false);
    }

    const onFacebookButtonPress = () => {
        LoginManager.logInWithPermissions(['public_profile', 'email']).then(
            function (result) {
                if (result.isCancelled) {
                    errorHandling(auth.FacebookAuthProvider.PROVIDER_ID, 'Facebook Login İptal Edildi');
                } else {
                    AccessToken.getCurrentAccessToken().then((data) => {
                        facebookAccessToken = data.accessToken;
                        const credential = auth.FacebookAuthProvider.credential(data.accessToken);
                        auth().signInWithCredential(credential).then((user) => {
                            onSuccessfulLogin(auth.FacebookAuthProvider.PROVIDER_ID, user, null);
                        }).catch((err) => {
                            errorHandling(auth.FacebookAuthProvider.PROVIDER_ID, err);
                        });
                    }).catch((err) => {
                        facebookAccessToken = "";
                        errorHandling(auth.FacebookAuthProvider.PROVIDER_ID, err);
                    });
                }
            },
            function (err) {
                errorHandling(auth.FacebookAuthProvider.PROVIDER_ID, err);
            }
        );
    };

    const onAppleButtonPress = async () => {
        try {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });

            const { identityToken, nonce, fullName, email } = appleAuthRequestResponse;
            const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

            let fullName_ = '';
            if (fullName.namePrefix) fullName_ = fullName_ + fullName.namePrefix + ' ';
            if (fullName.givenName) fullName_ = fullName_ + fullName.givenName + ' ';
            if (fullName.familyName) fullName_ = fullName_ + fullName.familyName + ' ';
            if (fullName.nickname) fullName_ = fullName_ + fullName.nickname + ' ';
            if (fullName.middleName) fullName_ = fullName_ + fullName.middleName + ' ';
            if (fullName.nameSuffix) fullName_ = fullName_ + fullName.nameSuffix + ' ';

            auth().signInWithCredential(appleCredential).then((user) => {
                onSuccessfulLogin(auth.AppleAuthProvider.PROVIDER_ID, user, fullName_);
            }).catch((err) => errorHandling(auth.AppleAuthProvider.PROVIDER_ID, err));
        } catch (err) {
            errorHandling(auth.AppleAuthProvider.PROVIDER_ID, err);
        }
    };

    const onGoogleButtonPress = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(userInfo.idToken);
            auth().signInWithCredential(googleCredential).then((user) => {
                onSuccessfulLogin(auth.GoogleAuthProvider.PROVIDER_ID, user, null);
            }
            ).catch((err) => errorHandling(auth.GoogleAuthProvider.PROVIDER_ID, err));
        } catch (err) {
            errorHandling(auth.GoogleAuthProvider.PROVIDER_ID, err);
        }
    };

    const onSuccessfulLogin = async (provider, data, _fullName) => {
        const userExist = await users.checkUserExist(data.additionalUserInfo.profile.email);
        let user = {};
        if (userExist) {
            user = await updateUserData(provider, data, userExist);
        }
        else {
            user = await userCreate(provider, data, _fullName);
        }
        setLoading(false);
        await analytics().setUserId(user.id);
        await analytics().setUserProperties({
            name: user.name,
            email: user.email,
            provider: provider,
            appleId: user.appleId,
            facebookId: user.facebookId,
            googleId: user.googleId,
            appVersion: user.appVersion,
            country: user.country,
            language: user.language,
            carrier: user.deviceData.carrier,
            timeZone: user.deviceData.timeZone.toString(),
            os: user.deviceData.os,
            brand: user.deviceData.brand,
            model: user.deviceData.model,
            hasNotch: user.deviceData.hasNotch.toString(),
            isEmulator: user.deviceData.isEmulator.toString(),
            isTablet: user.deviceData.isTablet.toString(),
        });
        await userStore.setUser(user);

        if (route.params?.from == "ParityDetail")
            navigation.navigate("ParityDetail", { data: route.params.parity });
        else
            navigation.navigate("Profile", { data: userStore.me });
    }

    const userCreate = async (provider, data, _fullName) => {
        const user = {
            id: data.user.uid,
            name: data.user.displayName,
            email: data.additionalUserInfo.profile.email,
            imageUri: data.user.photoURL,
            providers: [provider],
            lastProvider: provider,
            notificationToken: await getNotificationToken(),
            createdAt: Date.now(),
            appleId: '',
            facebookId: '',
            googleId: '',
            isBlocked: false,
            appVersion: packageJson.version,
            country: RNLocalize.getLocales()[0].countryCode,
            language: RNLocalize.getLocales()[0].languageCode,
            registerIp: deviceStore.ip.publicIP,
            lastLoginIp: deviceStore.ip.publicIP,
            deviceData: deviceStore.info,
            followersCount: 0,
            followingsCount: 0,
            commentsCount: 0,
        } as User;

        if (provider == auth.AppleAuthProvider.PROVIDER_ID && _fullName) {
            user.name = _fullName;
        }

        switch (provider) {
            case auth.FacebookAuthProvider.PROVIDER_ID: user.facebookId = data.user.uid; break;
            case auth.AppleAuthProvider.PROVIDER_ID: user.appleId = data.user.uid; break;
            case auth.GoogleAuthProvider.PROVIDER_ID: user.googleId = data.user.uid; break;
        }

        if (provider == auth.GoogleAuthProvider.PROVIDER_ID && data.user.photoURL) {
            user.imageUri = user.imageUri.replace("s96-c", "s400-c?i=1");
        }
        else if (provider == auth.FacebookAuthProvider.PROVIDER_ID && data.additionalUserInfo.profile.picture.data.url) {
            user.imageUri = await getFacebookProfilePicture(data.additionalUserInfo.profile.id);
        }
        await users.create(user);

        await analytics().logSignUp({
            method: provider
        });

        return user;
    }

    const updateUserData = async (provider, data, userExist) => {
        let user = userExist;
        if (!user.providers.includes(provider)) {
            user.providers.push(provider);
        }
        user.lastProvider = provider;
        user.updatedAt = Date.now();
        appVersion: packageJson.version;

        user.notificationToken = await getNotificationToken();
        user.lastLoginIp = deviceStore.ip.publicIP;
        switch (provider) {
            case auth.FacebookAuthProvider.PROVIDER_ID: user.facebookId = data.user.uid; break;
            case auth.AppleAuthProvider.PROVIDER_ID: user.appleId = data.user.uid; break;
            case auth.GoogleAuthProvider.PROVIDER_ID: user.googleId = data.user.uid; break;
        }
        if (provider == auth.GoogleAuthProvider.PROVIDER_ID && data.user.photoURL) {
            user.imageUri = data.user.photoURL;
            user.imageUri = user.imageUri.replace("s96-c", "s400-c?i=1");
        }
        else if (provider == auth.FacebookAuthProvider.PROVIDER_ID && data.additionalUserInfo.profile.picture.data.url) {
            user.imageUri = await getFacebookProfilePicture(data.additionalUserInfo.profile.id);
        }
        await users.update(user.id, user);
        await analytics().logLogin({
            method: provider
        });
        return user;
    }

    return (
        <View style={styles.container}>
            <Image source={darkMode ? require('../assets/images/logo/header-default.png') : require('../assets/images/logo/header-login.png')} style={styles.logo} />
            <TouchableOpacity style={styles.back} onPress={goBack}>
                <Ionicons name="close" size={16} color={color('color8')} />
            </TouchableOpacity>
            <Image style={[styles.image]} source={darkMode ? require('../assets/images/general/login-image-dark.png') : require('../assets/images/general/login-image.png')} />
            <View style={styles.form}>
                <Text style={[styles.text, styles.txtTitle]}>{i18n.t("login_txt_title")}</Text>
                <Text style={[styles.text, styles.txtDescription]}>{i18n.t("login_txt_description")}</Text>
                <View style={styles.socialButtons}>
                    <TouchableOpacity style={styles.btnSocial} onPress={() => socialLogin("facebook.com")}>
                        <Image source={require('../assets/images/login-providers/facebook.png')} style={styles.socialIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnSocial} onPress={() => socialLogin("google.com")}>
                        <Image source={require('../assets/images/login-providers/google.png')} style={styles.socialIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnSocial} onPress={() => socialLogin("apple.com")}>
                        <Image source={require('../assets/images/login-providers/apple.png')} style={styles.socialIcon} />
                    </TouchableOpacity>
                </View>
            </View>
            <ActivityIndicator size="large" style={[styles.activityIndicator, { display: loading ? "flex" : "none", }]} color={color('color6')} />
        </View>
    );
};

export default LoginScreen;
