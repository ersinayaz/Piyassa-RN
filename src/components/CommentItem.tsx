import i18n from '../i18n/_i18n';
import { useStore } from '../store';
import { useFirestore } from '../db';
import { color } from '../assets/colors';
import ParityCard from '../components/ParityCard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState, useEffect, useRef } from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface CommentItemProps {
    data: any;
    navigation: any;
    parity: any;
}

const CommentItem = (props: CommentItemProps) => {
    const { data, navigation, parity } = props;
    const { userStore } = useStore();


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image style={styles.userImage} source={{ uri: data.user.imageUri }} />
                <View style={styles.headerCenter}>
                    <Text style={styles.userName}>{data.user.name}</Text>
                    <Text style={styles.timeAgo}>{"1 saat önce"}</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={() => { }} style={styles.btnAction}>
                        <Ionicons name="ellipsis-vertical" size={24} color={color("color7")} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.body}>
                <Text style={styles.txtBody}>{data.body}</Text>
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity onPress={() => { }} style={[styles.btnLike]}>
                    <Ionicons name={"heart-outline"} size={20} color={color("color3")} />
                    <Text style={{ fontSize: 14, color: color("color3"), marginLeft: 5, fontWeight: "bold" }}>{12}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CommentItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
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
        // color: color("color8"),
    },
    timeAgo: {
        fontSize: 12,
        color: color("color7"),
    },
    headerRight: {
    },
    btnAction: {
    },
    body: {
        marginTop: 10,
    },
    txtBody: {
        color: color("color8"),
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 10,
    },
    btnLike: {
        minWidth: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: .5,
        borderColor: color("color3"),
        flex: 0,
        borderRadius: 5,
        padding: 5,
        paddingLeft: 10,
        paddingRight: 10,
    },
});