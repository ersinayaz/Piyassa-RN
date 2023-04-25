import i18n from '../i18n/_i18n';
import { useStore } from '../store';
import { useFirestore } from '../db';
import { color } from '../assets/colors';
import Lottie from 'lottie-react-native';
import messaging from '@react-native-firebase/messaging';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

const NotificationModal = ({ modalRef }) => {
    const { userStore } = useStore();
    const { users } = useFirestore();

    const notificationPermission = async () => {
        modalRef.current.close();
        const messagingStatus = await messaging().requestPermission({
            sound: true,
            announcement: true,
            badge: true,
            alert: true,
            carPlay: true,
            criticalAlert: true,
            provisional: true,
            lockScreen: true,
            notificationCenter: true
        });
        if (messagingStatus === messaging.AuthorizationStatus.AUTHORIZED || messagingStatus === messaging.AuthorizationStatus.PROVISIONAL) {
            const token = await messaging().getToken();
            if (userStore.me) {
                const u = userStore.me;
                u.notificationToken = token;
                await userStore.setUser(u);

                await users.update(userStore.me.id, {
                    notificationToken: token
                });
            }
        }
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.back} onPress={() => { modalRef.current.close(); }}>
                <Ionicons name="close" size={16} color={color('color9')} />
            </TouchableOpacity>
            <View style={styles.lottie}>
                <Lottie source={require('../assets/animations/notification.json')} autoPlay loop />
            </View>
            <View style={{ justifyContent: "center" }}>
                <Text style={styles.modalTitle}>{"Bildirimlere İzin Verin"}</Text>
                <Text style={styles.modalDescription}>{i18n.t("perm_notification_description")}</Text>
                <TouchableOpacity style={styles.btn} onPress={notificationPermission}>
                    <Text style={styles.btnText}>{i18n.t("perm_btn_notification_permission_ok")}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default NotificationModal;

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        paddingHorizontal: 40,
        justifyContent: "center"
    },
    back: {
        top: 0,
        right: 20,
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
    btn: {
        padding: 15,
        marginTop: 20,
        borderRadius: 10,
        backgroundColor: color("color3")
    },
    btnText: {
        fontWeight: "bold",
        textAlign: "center",
        color: color("color6")
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        color: color("color8"),
    },
    modalDescription: {
        fontSize: 14,
        marginTop: 10,
        textAlign: "center",
        color: color("color8"),
    },
    lottie: {
        width: "100%",
        height: 150,
    }
});