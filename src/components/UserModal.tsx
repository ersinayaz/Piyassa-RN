import i18n from '../i18n/_i18n';
import { useStore } from '../store';
import { useFirestore } from '../db';
import React, { useState } from 'react';
import { color } from '../assets/colors';
import useColorScheme from '../assets/useColorScheme';
import analytics from '@react-native-firebase/analytics';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';

const UserModal = ({ navigation, user, parity, modalRef }) => {
    const { userStore } = useStore();
    const { relationships, users } = useFirestore();
    const [isFollowings, setIsFollowings] = useState(userStore.isFollowing(user.id));
    const colorScheme = useColorScheme();
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            paddingHorizontal: 20,
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
            color: color("color8")
        }
    
    });

    const followOrUnfollow = async () => {
        if (!userStore.me) {
            navigation.navigate('Login', { navigation, parity, from: "ParityDetail" });
            return;
        }
        const anotherUser = await users.getById(user.id);

        !isFollowings ? follow(anotherUser) : unfollow(anotherUser);
    }

    const follow = async (anotherUser) => {

        const relationship = await relationships.create({
            followerId: userStore.me.id,
            followedId: anotherUser.id,
        });
        userStore.follow(relationship);
        await analytics().logEvent('follow', {
            follower_id: userStore.me.id,
            followed_id: anotherUser.id,
        });

        userStore.me.followersCount = userStore.me.followersCount + 1;
        await userStore.setUser(userStore.me);

        await users.update(userStore.me.id, {
            followersCount: userStore.me.followersCount
        });

        await users.update(anotherUser.id, {
            followingsCount: anotherUser.followingsCount + 1
        });

        modalRef.current.close();
    }

    const unfollow = async (anotherUser) => {
        const relationship = userStore.followings.find((relationship) => relationship.followedId === anotherUser.id);
        await relationships.delete(relationship.id);

        userStore.unFollow(anotherUser.id);
        await analytics().logEvent('unfollow', {
            follower_id: userStore.me.id,
            followed_id: anotherUser.id,
        });

        if (userStore.me.followersCount > 0) {
            userStore.me.followersCount = userStore.me.followersCount - 1;
        }
        await userStore.setUser(userStore.me);

        await users.update(userStore.me.id, {
            followersCount: userStore.me.followersCount
        });

        if (anotherUser.followingsCount > 0) {
            await users.update(anotherUser.id, {
                followingsCount: anotherUser.followingsCount - 1
            });
        }

        modalRef.current.close();
    }

    return (
        <View style={styles.container}>
            {user.imageUri ?
                <Image style={styles.userImage} source={{ uri: user.imageUri }} />
                :
                <Image style={styles.userImage} source={require('../assets/images/user/default.png')} />
            }
            <View style={{ marginLeft: 20, justifyContent: "center" }}>
                <Text style={styles.userName}>{user.name}</Text>
                {userStore.me == null || userStore.me?.id != user.id ?
                    <TouchableOpacity onPress={followOrUnfollow} style={[styles.btnNotification, { backgroundColor: isFollowings ? color("color5") : color("color3") }]}>
                        <Ionicons name={isFollowings ? "remove" : "add"} size={20} color={color("color8")} />
                        <Text style={styles.btnNotificationText}>{isFollowings ? i18n.t("txt_cdm_userUnFollow") : i18n.t("txt_cdm_userFollow")}</Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={() => {
                        modalRef.current.close(); navigation.navigate("Profile");
                    }} style={[styles.btnNotification, { backgroundColor: color("color2"), width: "90%" }]}>
                        <Text style={styles.btnNotificationText}>{i18n.t("txt_myProfile")}</Text>
                    </TouchableOpacity>
                }
            </View>
        </View>
    );
};

export default UserModal;