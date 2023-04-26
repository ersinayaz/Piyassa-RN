import i18n from '../i18n/_i18n';
import { useStore } from '../store';
import { useFirestore } from '../db';
import { color } from '../assets/colors';
import auth from '@react-native-firebase/auth';
import FeedbackModal from '../components/FeedbackModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState, useEffect, useRef } from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import BottomDrawer, { BottomDrawerMethods } from 'react-native-animated-bottom-drawer';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Platform, Linking } from 'react-native';

const SettingsScreen = ({ navigation, route }) => {
    const { userStore } = useStore();
    const { feedbacks } = useFirestore();
    const APP_STORE_LINK = `itms-apps://apps.apple.com/app/id6447705863?action=write-review`;
    const PLAY_STORE_LINK = `market://details?id=tr.com.piyassa`;
    const STORE_LINK = Platform.select({ ios: APP_STORE_LINK, android: PLAY_STORE_LINK });
    const feedbackModalRef = useRef<BottomDrawerMethods>(null);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (<><Text style={styles.headerTitle}>{i18n.t("lbl_settings_title")}</Text></>),
            headerLeft: () => (
                <>
                    <TouchableOpacity onPress={() => { navigation.goBack(); }} style={styles.headerLeft}>
                        <FontAwesome5 color={color("buttonText")} name="chevron-left" size={16} />
                    </TouchableOpacity>
                </>),
        });

    }, []);

    const Item = ({ icon, title, callback, logout }) => (
        <TouchableOpacity onPress={callback} style={[styles.item, logout ? styles.logout : null]}>
            <Ionicons color={!logout ? color("color8") : "#FC1C44"} name={icon ? icon : "ios-arrow-forward"} size={24} />
            <Text style={[styles.title, { color: !logout ? color("color8") : "#FC1C44" }]}>{title}</Text>
            {
                logout ? null : <Ionicons color={color("color8")} name={"chevron-forward"} size={20} />
            }
        </TouchableOpacity>
    );

    const newFeedback = () => {
        navigation.navigate('TextArea', {
            maxLength: 2000,
            title: i18n.t('txt_newFeedback'),
            placeholder: i18n.t('txt_newFeedbackPlaceholder'),
            buttonTitle: i18n.t('btn_newFeedbackSend'),
            onSuccess: async (text: string, extraData?: any) => {

                navigation.navigate('Settings');
                await feedbacks.create({
                    body: text,
                    status: 'pending',
                    user: {
                        id: userStore.me.id,
                        name: userStore.me.name,
                        email: userStore.me.email,
                        imageUri: userStore.me.imageUri
                    }
                });

                feedbackModalRef.current.open();
            }
        });
    };

    const signOut = async () => {
        await auth().signOut().finally(async () => {
            await userStore.logout();
            navigation.goBack();
        });
    }

    const rateUs = () => {
        Linking.openURL(STORE_LINK);
    }

    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1, width: "100%" }}>
                <Item icon={"chatbox-ellipses-outline"} title={i18n.t("lbl_settings_feedback")} callback={newFeedback} />
                <Item icon={"ios-heart-outline"} title={i18n.t("lbl_settings_rateUs")} callback={rateUs} />
                <Item icon={"lock-closed-outline"} title={i18n.t("lbl_settings_privacy")} callback={() => { navigation.navigate("Policy", { title: i18n.t("lbl_settings_privacy"), type: 1 }); }} />
                <Item icon={"document-text-outline"} title={i18n.t("lbl_settings_terms")} callback={() => { navigation.navigate("Policy", { title: i18n.t("lbl_settings_terms"), type: 2 }); }} />
                <Item icon={"ios-person-remove-outline"} title={i18n.t("lbl_settings_account_delete")} callback={() => { navigation.navigate("DeleteAccount"); }} />
                <Item icon={"alert-circle-outline"} title={i18n.t("lbl_settings_about")} callback={() => { navigation.navigate("Policy", { title: i18n.t("lbl_settings_about"), type: 3 }); }} />
            </ScrollView>
            <Item logout icon={"ios-exit-outline"} title={i18n.t("lbl_settings_logout")} callback={signOut} />
            <BottomDrawer customStyles={{ container: { backgroundColor: color("color6") } }} ref={feedbackModalRef} initialHeight={350}>
                <FeedbackModal modalRef={feedbackModalRef} />
            </BottomDrawer>
        </View>
    );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 5,
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'center',
        backgroundColor: color("color6"),
    },
    item: {
        height: 70,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: .5,
        justifyContent: "space-between",
        borderBottomColor: color("color5"),
    },
    title: {
        flex: 1,
        fontSize: 14,
        marginLeft: 15,
        fontWeight: "500"
    },
    logout: {
        borderTopWidth: .5,
        borderBottomWidth: 0,
        borderTopColor: color("color5"),
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
});
