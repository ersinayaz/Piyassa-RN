import { color } from '../assets/colors';
import RenderHtml from 'react-native-render-html';
import React, { useState, useEffect } from 'react';
import { staticContent } from '../assets/data/staticContent';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';

const PolicyScreen = ({ navigation, route }) => {
    const { title, type } = route.params;
    const width = Dimensions.get('window').width;
    const [source, setSource] = useState({ html: type == 1 ? staticContent.privactPolicy : type == 2 ? staticContent.termsOfUse : staticContent.aboutUs });

    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (<><Text style={styles.headerTitle}>{title}</Text></>),
            headerLeft: () => (
                <>
                    <TouchableOpacity onPress={() => { navigation.goBack(); }} style={styles.headerLeft}>
                        <FontAwesome5 color={color("buttonText")} name="chevron-left" size={16} />
                    </TouchableOpacity>
                </>),
        });

    }, []);
    return (
        <View style={styles.container}>
            {type == 3 ?
                <View style={styles.imageView}>
                    <Image source={require('../assets/images/logo/splash.png')} style={{ width: "100%", height: "100%", resizeMode: "contain" }} />
                </View>
                : null
            }
            <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                <Text style={styles.title}>{title}</Text>
                <RenderHtml
                    contentWidth={width}
                    source={source}
                />
            </ScrollView>
        </View>
    );
};

export default PolicyScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color("color6")
    },
    headerTitle: {
        fontSize: 17,
        color: color("color6"),
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
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: color("color8")
    },
});
