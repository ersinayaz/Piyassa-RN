import i18n from '../i18n/_i18n';
import { useStore } from '../store';
import { color } from '../assets/colors';
import React, { useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions, Keyboard, Image, InputAccessoryView } from 'react-native';

const TextArea = ({ navigation, route }) => {
    const { deviceStore, userStore } = useStore();
    const onSuccess = route.params?.onSuccess;
    const onCancel = route.params?.onCancel || (() => { navigation.goBack() });
    const title = route.params?.title || i18n.t('textAreaTitle');
    const placeholder = route.params?.placeholder || i18n.t('textAreaPlaceholder');
    const buttonTitle = route.params?.buttonTitle || i18n.t('textAreaButtonTitle');
    const maxLength = route.params?.maxLength || 500;
    const minLength = route.params?.minLength || 10;
    const extraData = route.params?.extraData || {};
    const buttonLeftImage = route.params?.buttonLeftImage || null;
    const [text, setText] = useState('');
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);


    useEffect(() => {
        const openKeyboard = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
            setScreenHeight(Dimensions.get('window').height - e.endCoordinates.height);
        });
        const hideKeyboard = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
            setScreenHeight(Dimensions.get('window').height);
        });

        return () => {
            openKeyboard.remove();
            hideKeyboard.remove();
        };
    }, []);

    useEffect(() => {
        setText(text.trimStart().replace('\n\n\n', '\n\n'));
    }, [text]);


    return (
        <>
            <View style={styles.container}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity style={styles.back} onPress={onCancel}>
                    <Ionicons name="close" size={16} color={color('color9')} />
                </TouchableOpacity>
                <View style={styles.newCommentView}>
                    <View style={styles.imageView}>
                        {
                            userStore.me?.imageUri ?
                                <Image source={{ uri: userStore.me.imageUri }} style={styles.profilePicture} />
                                :
                                <Image style={styles.profilePicture} source={require('../assets/images/user/default.png')} />
                        }
                    </View>
                    <View style={{ width: "87%" }}>
                        <TextInput placeholderTextColor={color("color4")} maxLength={maxLength} onChangeText={(text) => setText(text)} value={text} placeholder={placeholder} style={[styles.txtComment, { maxHeight: (screenHeight - 140) }]} autoCapitalize="sentences" autoFocus multiline={true} textContentType='none' inputAccessoryViewID='newComment' />
                        <View>
                            <Text style={{ fontSize: 13, color: color("color8") }}>{i18n.t("lbl_newCommentCharactersRemaining")}: <Text style={{ fontWeight: "bold", color: color("color8") }}>{text.length == 0 ? maxLength : maxLength - text.length}</Text></Text>
                        </View>
                    </View>
                </View>
            </View>

            <InputAccessoryView autoFocus={true} nativeID="newComment" style={{ height: 65, padding: 10 }} backgroundColor={color("keyboardArea")}>
                <TouchableOpacity onPress={() => { onSuccess(text.split(), extraData); }} disabled={text.length < minLength ? true : false} style={[styles.btnNewComment, { backgroundColor: text.length < minLength ? color("color4") : color("color3"), flexDirection: "row" }]} >
                    <Text style={[styles.txtNewComment]}>{buttonTitle}</Text>
                    <View style={[styles.txtNewComment, styles.missingCharView, { display: text.length >= minLength ? "none" : "flex" }]}>
                        <Text style={styles.txtMissingChar}>{text.length < minLength ? (minLength - text.length) : ""}</Text>
                    </View>
                    {
                        buttonLeftImage ?
                            <View style={[styles.parityIconView]}>
                                <Image style={styles.parityIcon} source={buttonLeftImage} />
                            </View>
                            : null
                    }
                </TouchableOpacity>
            </InputAccessoryView>
        </>
    );
};

export default TextArea;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: color("color6"),
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: color("color8")
    },
    newCommentView: {
        flexDirection: "row",
    },
    imageView: {
        width: 60,
        marginTop: 24
    },
    profilePicture: {
        width: 46,
        height: 46,
        borderRadius: 20,
        backgroundColor: color('color5')
    },
    btnNewComment: {
        height: 47.5,
        maxWidth: "100%",
        borderRadius: 12.5,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: color("color3"),
    },
    txtNewComment: {
        fontSize: 15,
        fontWeight: "500",
        textAlign: "center",
        color: color("buttonText"),
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
    txtComment: {
        width: "95%",
        marginTop: 20,
        paddingLeft: 0,
        paddingBottom: 10,
        marginBottom: 10,
        textAlignVertical: "bottom",
        color: color("color8")
    },
    missingCharView: {
        right: 10,
        opacity: .5,
        width: 27.5,
        padding: 7.5,
        height: 27.5,
        borderRadius: 27.5,
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: color("color5")
    },
    txtMissingChar: {
        fontSize: 11,
        fontWeight: "500",
    },
    parityIconView: {
        left: 10,
        position: "absolute",
    },
    parityIcon: {
        width: 27.5,
        height: 27.5,
        borderRadius: 27.5
    }
});
