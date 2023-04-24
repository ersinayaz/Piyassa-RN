import i18n from '../i18n/_i18n';
import { useStore } from '../store';
import { useFirestore } from '../db';
import React, { useState } from 'react';
import { color } from '../assets/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';

const UserModal = ({ navigation, user, parity, modalRef }) => {
    const { userStore } = useStore();
    const { relationships } = useFirestore();
    const [isFollowings, setIsFollowings] = useState(userStore.isFollowing(user.id));

    const followOrUnfollow = async () => {
        if (!userStore.me) return navigation.navigate('Login', { navigation, parity, from: "ParityDetail" });

        if (!isFollowings) {
            const relationship = await relationships.create({
                followerId: userStore.me.id,
                followedId: user.id,
            });

            userStore.follow(relationship);
            modalRef.current.close();
        } else {
            const relationship = userStore.followings.find((relationship) => relationship.followedId === user.id);
            await relationships.delete(relationship.id);
            userStore.unFollow(user.id);
            modalRef.current.close();
        }
    }

    return (
        <View style={styles.container}>
            <Image style={styles.userImage} source={{ uri: user.imageUri }} />
            <View style={{ marginLeft: 20, justifyContent: "center" }}>
                <Text style={styles.userName}>{user.name}</Text>
                {userStore.me == null || userStore.me?.id != user.id ?
                    <TouchableOpacity onPress={followOrUnfollow} style={[styles.btnNotification, { backgroundColor: isFollowings ? color("color8") : color("color2") }]}>
                        <Ionicons name={isFollowings ? "remove" : "add"} size={20} color={color("color6")} />
                        <Text style={styles.btnNotificationText}>{isFollowings ? i18n.t("txt_cdm_userUnFollow") : i18n.t("txt_cdm_userFollow")}</Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={() => { navigation.navigate("Profile"); }} style={[styles.btnNotification, { backgroundColor: color("color2"), width: "90%" }]}>
                        <Text style={styles.btnNotificationText}>{i18n.t("txt_myProfile")}</Text>
                    </TouchableOpacity>
                }
            </View>
        </View>
    );
};

export default UserModal;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 20
    },
    userImage: {
        width: 92,
        height: 92,
        borderRadius: 40
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: color("color8")
    },
    btnNotification: {
        marginTop: 5,
        borderRadius: 7.5,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        justifyContent: "center",
    },
    btnNotificationText: {
        marginLeft: 5,
        color: color("color6")
    }

});