import i18n from '../i18n/_i18n';
import { useStore } from '../store';
import { useFirestore } from '../db';
import { color } from '../assets/colors';
import useColorScheme from '../assets/useColorScheme';
import auth from '@react-native-firebase/auth';
import React, { useState, useEffect } from 'react';
import analytics from '@react-native-firebase/analytics';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Text, View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';


const DeleteAccountScreen = ({ navigation, route }) => {
    const { userStore, commentStore } = useStore();
    const { users, comments, deletedUsers } = useFirestore();
    const colorScheme = useColorScheme();
    const styles = StyleSheet.create({
        informationView: {
            width: "100%",
            padding: 30,
    
        },
        subTitle: {
            fontSize: 14,
            marginTop: 10,
            fontWeight: "600",
            textAlign: "center",
            color: color("color8"),
        },
        description: {
            fontSize: 14,
            marginTop: 5,
            textAlign: "center",
            color: color("color8"),
        },
        buttonView: {
            width: "100%",
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        button: {
            width: "48%",
            height: 50,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: color("color1"),
            borderRadius: 5,
        },
        buttonText: {
            fontSize: 14,
            color: color("buttonText"),
        },
        container: {
            flex: 1,
            backgroundColor: color("color6")
        },
        headerTitle: {
            fontSize: 17,
            color: color("color4"),
        },
        headerLeft: {
            left: 16,
            zIndex: 2,
            width: 36,
            height: 36,
            marginTop: -10,
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: color("color1")
        },
        imageView: {
            width: "100%",
            height: 120,
            paddingLeft: 75,
            paddingRight: 75,
            marginTop: -20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: color("color2")
        },
        contentArea: {
            flex: 1,
            padding: 20,
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            marginTop: 20,
            fontSize: 16,
            fontWeight: "bold",
            color: color("color8")
        },
        imageBox: {
            marginTop: 10,
            alignItems: "center",
            justifyContent: "center",
        },
        image: {
            borderWidth: 2,
            borderColor: color("color6"),
            zIndex: 1,
            width: 150,
            height: 150,
            borderRadius: 60,
            resizeMode: "cover",
        },
        providerIcon: {
            right: 0,
            bottom: 0,
            width: 32,
            zIndex: 1,
            height: 32,
            borderRadius: 15,
            position: "absolute",
            resizeMode: "contain"
        },
    });

    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (<><Text style={styles.headerTitle}>{i18n.t("lbl_settings_account_delete")}</Text></>),
            headerLeft: () => (
                <>
                    <TouchableOpacity onPress={() => { navigation.goBack(); }} style={styles.headerLeft}>
                        <FontAwesome5 color={color("buttonText")} name="chevron-left" size={16} />
                    </TouchableOpacity>
                </>),
        });

    }, []);

    const deleteAccount = async () => {
        Alert.alert(
            i18n.t("lbl_settings_account_delete"),
            i18n.t("lbl_settings_account_delete_description"),
            [
                {
                    text: i18n.t("btn_cancel"),
                    onPress: () => navigation.goBack(),
                    style: "cancel"
                },
                {
                    text: i18n.t("btn_account_delete"), onPress: async () => {
                        await analytics().logEvent('delete_account', {
                            method: userStore.me?.lastProvider,
                            user_id: userStore.me?.id,
                            name: userStore.me?.name,
                            email: userStore.me?.email,
                            os: userStore.me?.deviceData.os
                        });
                        const userId = userStore.me.id;
                        await deletedUsers.create(userStore.me);
                        await users.delete(userId);
                        await comments.deleteByUserId(userId);
                        commentStore.dumpUserComments([]);
                        commentStore.dumpComments('d', []);
                        commentStore.dumpComments('e', []);
                        commentStore.dumpComments('p', []);
                        commentStore.dumpComments('o', []);
                        commentStore.dumpComments('o2', []);
                        commentStore.dumpComments('g', []);
                        commentStore.dumpComments('s', []);
                        commentStore.dumpComments('btc', []);
                        commentStore.dumpComments('eth', []);

                        await auth().signOut().finally(async () => {
                            await userStore.logout();
                            // navigation.popToTop();
                            navigation.navigate("Profile");
                        });
                    }
                }
            ],
            { cancelable: false }
        );
    }

    return (
        <View style={styles.container}>
            {/* <View style={styles.imageView}>
                <Image source={require('../assets/images/logo/splash.png')} style={{ width: "100%", height: "100%", resizeMode: "contain" }} />
            </View> */}
            <View style={styles.contentArea}>
                <View style={styles.imageBox}>
                    {userStore.me.imageUri ?
                        <Image style={styles.image} source={{ uri: userStore.me.imageUri }} />
                        :
                        <Image style={styles.image} source={require('../assets/images/user/default.png')} />
                    }
                </View>


                <View style={styles.informationView}>
                    <Text style={styles.subTitle}>{i18n.t("lbl_settings_account_delete_subTitle")}</Text>
                    <Text style={styles.description}>{i18n.t("lbl_settings_account_delete_description")}</Text>
                </View>
                <FontAwesome5 name="exclamation-circle" size={70} color={color("color8")} style={{ marginTop: 40 }} />

            </View>
            <View style={styles.buttonView}>

                <TouchableOpacity onPress={() => { deleteAccount(); }} style={styles.button}>
                    <Text style={styles.buttonText}>{i18n.t("btn_account_delete")}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { navigation.goBack() }} style={[styles.button, { backgroundColor: color("color4") }]}>
                    <Text style={[styles.buttonText, { fontWeight: "bold" }]}>{i18n.t("btn_cancel")}</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
};

export default DeleteAccountScreen;