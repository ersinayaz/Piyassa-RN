import 'moment/locale/tr';
import moment from 'moment';
import { reaction } from 'mobx';
import i18n from '../i18n/_i18n';
import UserModal from './UserModal';
import { useStore } from '../store';
import { useFirestore } from '../db';
import { Parities } from '../models';
import { color } from '../assets/colors';
import FeedbackModal from './FeedbackModal';
import ParityCard from '../components/ParityCard';
import { comments } from '../db/FirestoreDatabase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState, useEffect, useRef } from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import BottomDrawer, { BottomDrawerMethods } from 'react-native-animated-bottom-drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActionSheetIOS, Share } from 'react-native';

moment.locale('tr');

interface CommentItemProps {
    data: any;
    navigation: any;
    parity: any;
    profileScreen?: boolean;
}

const CommentItem = (props: CommentItemProps) => {
    const { data, navigation, parity, profileScreen } = props;
    const userModalRef = useRef<BottomDrawerMethods>(null);
    const feedbackModalRef = useRef<BottomDrawerMethods>(null);
    const { userStore, commentStore } = useStore();
    const { reports, users } = useFirestore();
    const [isLiked, setIsLiked] = useState(userStore.isLikedComment(data.id));


    useEffect(() => {
        reaction(() => userStore.me?.commentsCount, async (data, prev) => {
            setIsLiked(userStore.isLikedComment(data.id));
        });
    }, []);


    const showAction = () => {
        var options = [i18n.t("btn_cancel"), !isLiked ? i18n.t("txt_cdm_commentLike") : i18n.t("txt_cdm_commentUnlike"), i18n.t("txt_cdm_commentShare"), i18n.t("txt_cdm_commentComplaint")];


        if (userStore.me?.id == data.user.id) {
            options.push(i18n.t("txt_cmd_commentDelete"));
        }

        ActionSheetIOS.showActionSheetWithOptions(
            {
                cancelButtonIndex: 0,
                destructiveButtonIndex: 3,
                title: i18n.t("txt_cdm_commentActionTitle"),
                message: i18n.t("txt_cdm_commentActionDescription"),
                options: options,
            },
            buttonIndex => {
                switch (buttonIndex) {
                    case 0: break;
                    case 1: likeOrUnlike(); break;
                    case 2: share(); break;
                    case 3: report(); break;
                    case 4: deleteComment(); break;
                }
            },
        );
    }

    const deleteComment = async () => {
        if (userStore.me?.id == data.user.id) {
            const deleted = comments.delete(data.id);
            if (deleted) {
                if (userStore.me.commentsCount > 0) {
                    userStore.me.commentsCount--;
                }
                await userStore.setUser(userStore.me);
                await users.update(userStore.me.id, { commentsCount: userStore.me.commentsCount });
                await commentStore.deleteComment(data.parity.id, data.id);
            }
        }
    }

    const report = async () => {
        const report = await reports.create({
            status: 'pending',
            commentId: data.id,
            userId: userStore.me?.id || null,
        });
        feedbackModalRef.current.open();
    }

    const share = async () => {
        try {
            const result = await Share.share({
                message: data.body.toString(),
                title: parity.name,
                subject: parity.description,
                dialogTitle: parity.name
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    }

    const likeOrUnlike = () => {
        if (!userStore.me) return navigation.navigate('Login', { navigation, parity, from: "ParityDetail" });

        if (profileScreen != true) {
            if (isLiked) {
                userStore.unlikeComment(data.id);
                if (data.likeCount > 0) {
                    data.likeCount--;
                    commentStore.updateComment(data.parity.id, data);
                }
                setIsLiked(false);
            } else {
                userStore.likeComment(data.id);
                data.likeCount++;
                commentStore.updateComment(data.parity.id, data);
                setIsLiked(true);
            }
            comments.update(data.id, { likeCount: data.likeCount });
        }
    }

    const getParity = () => {
        return Parities.find(p => p.id == parity.id);
    }

    return (
        <View style={styles.container}>
            {
                profileScreen == true ?
                    <View style={styles.profileScreenInfoContainer}>
                        <Image source={getParity(parity.id).image} style={{ width: 18, height: 18 }} />
                        <Text style={{ color: color("color8"), fontWeight: "500", marginLeft: 10 }}>{getParity(parity.id).name} Yorumu</Text>
                    </View>
                    :
                    null
            }
            <View style={styles.header}>
                <TouchableOpacity onPress={() => { userModalRef.current.open() }}>
                    {data.user.imageUri ?
                        <Image style={styles.userImage} source={{ uri: data.user.imageUri }} />
                        :
                        <Image style={styles.userImage} source={require('../assets/images/user/default.png')} />
                    }
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <TouchableOpacity onPress={() => { userModalRef.current.open() }}>
                        <Text style={styles.userName}>{data.user.name}</Text>
                    </TouchableOpacity>
                    <Text style={styles.timeAgo}>{moment(data.createdAt).fromNow()}</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={showAction} style={styles.btnAction}>
                        <Ionicons name="ellipsis-vertical" size={24} color={color("color7")} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.body}>
                <Text style={styles.txtBody} selectable>{data.body}</Text>
            </View>
            {profileScreen == false ?
                <View style={styles.buttons}>
                    <TouchableOpacity onPress={likeOrUnlike} style={[styles.btnLike, userStore.isLikedComment(data.id) ? styles.btnLiked : styles.btnLike]}>
                        <Ionicons name={userStore.isLikedComment(data.id) ? "heart" : "heart-outline"} size={20} color={color(userStore.isLikedComment(data.id) ? "color5" : "color3")} />
                        <Text style={[styles.txtLikeCount, { color: color(userStore.isLikedComment(data.id) ? "color5" : "color3"), display: data.likeCount == 0 ? "none" : "flex" }]}>{data.likeCount}</Text>
                    </TouchableOpacity>
                </View>
                :
                null
            }


            <BottomDrawer ref={userModalRef} initialHeight={150} openDuration={250} closeDuration={100}>
                <UserModal navigation={navigation} parity={parity} user={data.user} modalRef={userModalRef} />
            </BottomDrawer>
            <BottomDrawer ref={feedbackModalRef} initialHeight={350}>
                <FeedbackModal modalRef={feedbackModalRef} />
            </BottomDrawer>
        </View>
    );
};

export default CommentItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userImage: {
        width: 46,
        height: 46,
        borderRadius: 20
    },
    headerCenter: {
        flex: 1,
        marginLeft: 20
    },
    userName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: color("color8")
    },
    timeAgo: {
        fontSize: 12,
        color: color("color7"),
    },
    headerRight: {
        right: -10,
    },
    btnAction: {
    },
    body: {
        marginVertical: 5,
    },
    txtBody: {
        color: color("color8")
    },
    buttons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    btnLike: {
        minWidth: 75,
        borderWidth: 1,
        borderRadius: 7.5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        borderColor: color("color3")
    },
    btnLiked: {
        backgroundColor: color("color3"),
    },
    txtLikeCount: {
        fontSize: 14,
        marginLeft: 5,
        fontWeight: "bold"
    },
    profileScreenInfoContainer: {
        height: 36,
        paddingLeft: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color("color5"),
        borderRadius: 10,
    }
});