import 'moment/locale/tr';
import moment from 'moment';
import i18n from '../i18n/_i18n';
import UserModal from './UserModal';
import { useStore } from '../store';
import { useFirestore } from '../db';
import { color } from '../assets/colors';
import ParityCard from '../components/ParityCard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState, useEffect, useRef } from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import BottomDrawer, { BottomDrawerMethods } from 'react-native-animated-bottom-drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActionSheetIOS } from 'react-native';

moment.locale('tr');

interface CommentItemProps {
    data: any;
    navigation: any;
    parity: any;
}

const CommentItem = (props: CommentItemProps) => {
    const { data, navigation, parity } = props;
    const bottomDrawerRef = useRef<BottomDrawerMethods>(null);
    const { userStore } = useStore();


    const showAction = () => {
        ActionSheetIOS.showActionSheetWithOptions(
            {
                cancelButtonIndex: 0,
                destructiveButtonIndex: 3,
                userInterfaceStyle: 'light',
                title: 'Beğen & Paylaş & Şikayet Et',
                message: 'Gönderiyi beğenmek, paylaşmak\nveya şikayet etmek mi istiyorsunuz?',
                options: ['Vazgeç', 'Gönderiyi Beğen', 'Gönderiyi Paylaş', 'Şikayet Et'],
            },
            buttonIndex => {
                if (buttonIndex === 0) {
                } else if (buttonIndex === 1) {
                } else if (buttonIndex === 2) {
                }
            },
        );
    }

    const likeOrUnlike = () => {
        alert("likeOrUnlike")
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => { bottomDrawerRef.current.open() }}>
                    <Image style={styles.userImage} source={{ uri: data.user.imageUri }} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <TouchableOpacity onPress={() => { bottomDrawerRef.current.open() }}>
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
                <Text style={styles.txtBody}>{data.body}</Text>
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity onPress={likeOrUnlike} style={[styles.btnLike]}>
                    <Ionicons name={"heart-outline"} size={20} color={color("color3")} />
                    <Text style={styles.txtLikeCount}>{12}</Text>
                </TouchableOpacity>
            </View>

            <BottomDrawer ref={bottomDrawerRef} initialHeight={150} openDuration={250} closeDuration={100} >
                <UserModal navigation={navigation} parity={parity} user={data.user} modalRef={bottomDrawerRef} />
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
    txtLikeCount: {
        fontSize: 14,
        marginLeft: 5,
        fontWeight: "bold",
        color: color("color3")
    },
});