import 'moment/locale/tr';
import moment from 'moment';
import { reaction } from 'mobx';
import i18n from '../i18n/_i18n';
import { useStore } from '../store';
import { useFirestore } from '../db';
import { color } from '../assets/colors';
import React, { useState, useEffect } from 'react';
import CommentItem from '../components/CommentItem';
import useColorScheme from '../assets/useColorScheme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text, View, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';

moment.locale('tr');

const ProfileScreen = ({ navigation, route }) => {
    const { userStore, commentStore, feedStore } = useStore();
    const { comments } = useFirestore();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [commentList, setCommentList] = useState(feedStore.userComments || []);
    const colorScheme = useColorScheme();
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: "center",
            backgroundColor: color("color6"),
        },
        cover: {
            height: 180,
            width: "100%",
            alignItems: "center",
        },
        coverHack: {
            height: '50%',
            width: '100%',
            position: 'absolute',
            backgroundColor: color("color2")
        },
        headerTitle: {
            fontSize: 17,
            color: color("color4"),
        },
        headerRight: {
            right: 20,
            width: 36,
            height: 36,
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: color("color1")
        },
        header: {
            justifyContent: "center",
            alignItems: "center",
        },
        name: {
            fontSize: 24,
            fontWeight: "bold",
            color: color("color8"),
        },
        createdAt: {
            fontSize: 12,
            marginTop: 5,
            marginVertical: 15,
            color: color("color7")
        },
        imageBox: {
            marginTop: 10,
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
        counter: {
            marginVertical: 15,
            marginHorizontal: 15,
            flexDirection: "row",
            justifyContent: "space-evenly",
        },
        counterItem: {
            width: "30%",
            padding: 10,
            shadowRadius: 5,
            borderWidth: .5,
            borderRadius: 10,
            shadowOpacity: 0.1,
            alignItems: "center",
            shadowColor: '#171717',
            justifyContent: "center",
            marginHorizontal: "3.3%",
            borderColor: color("color5"),
            backgroundColor: color("color6"),
            shadowOffset: { width: 0, height: 1 }
        },
        counterItemTitle: {
            marginTop: 5,
            fontSize: 14,
            color: color("color7")
        },
        counterItemCount: {
            fontSize: 20,
            fontWeight: "bold",
            color: color("color3")
        },
        flatlist: {
            width: "100%"
        },
        itemSeparator: {
            height: .7,
            backgroundColor: color("color5"),
        },
    });

    const onRefresh = async () => {
        setRefreshing(true);
        const response = await comments.getCommentsByUserId(userStore.me.id);
        if (response) {
            if (JSON.stringify(response) !== JSON.stringify(feedStore.userComments)) {
                await feedStore.dumpUserComments(response);
                await feedStore.getUserComments();
                setCommentList(response);
            }
        }
        setRefreshing(false);
    }

    const onEndReached = async () => {
        if (feedStore.userComments.length > 0) {
            const lastComment = commentList[commentList.length - 1];
            const lastCommentCreatedAt = lastComment ? lastComment.createdAt : null;
            const response = await comments.getCommentsByUserId(userStore.me.id, lastCommentCreatedAt);
            setCommentList([...commentList, ...response]);
        }
    }

    useEffect(() => {
        const updateHeader = async () => {
            navigation.setOptions({
                headerLeft: () => (<></>),
                headerTitle: () => (<><Text style={styles.headerTitle}>{i18n.t("txt_myProfile")}</Text></>),
                headerRight: () => (
                    <>
                        <TouchableOpacity onPress={() => { navigation.navigate("Settings"); }} style={styles.headerRight}>
                            <Ionicons color={color("buttonText")} name="ios-settings" size={20} />
                        </TouchableOpacity>
                    </>)
            });
        }

        updateHeader();

        const fetchData = async () => {
            const response = await comments.getCommentsByUserId(userStore.me.id);
            if (response) {
                if (JSON.stringify(response) !== JSON.stringify(feedStore.userComments)) {
                    await feedStore.dumpUserComments(response)
                    await feedStore.getUserComments();
                    setCommentList(response);
                }
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        const reaction1 = reaction(() => feedStore.userComments, (feed, prev) => {
        //   if (JSON.stringify(feed) === JSON.stringify(prev)) return;
          setCommentList(feed);
        });
        return () => reaction1();
      }, [feedStore.userComments]);

    // useEffect(() => {
    //     const unsubscribe = navigation.addListener('focus', () => {
    //         if (!userStore.me)
    //             navigation.navigate('Login', { from: 'Profile' });
    //     });

    //     navigation.setOptions({
    //         headerLeft: () => (<></>),
    //         headerTitle: () => (<><Text style={styles.headerTitle}>{i18n.t("txt_myProfile")}</Text></>),
    //         headerRight: () => (
    //             <>
    //                 <TouchableOpacity onPress={() => { navigation.navigate("Settings"); }} style={styles.headerRight}>
    //                     <Ionicons color={color("buttonText")} name="ios-settings" size={20} />
    //                 </TouchableOpacity>
    //             </>)
    //     });

    //     // reaction(() => userStore.me?.commentsCount, async (data, prev) => {
    //     //     if (data != prev) {
    //     //         comments.getCommentsByUserId(userStore.me.id).then((data) => {
    //     //             setCommentList(data);
    //     //             setLoading(false);
    //     //         });
    //     //     }
    //     // });

    //     // commentStore.getUserComments().then((data) => {
    //     //     setCommentList(data);
    //     // });

    //     // comments.getCommentsByUserId(userStore.me.id).then((data) => {
    //     //     commentStore.dumpUserComments(data);
    //     // });

    //     reaction(() => userStore.me?.followersCount, async (data, prev) => {
    //         setCommentList(commentStore.userComments);
    //     });


    //     reaction(() => commentStore.userComments, async (data, prev) => {
    //         setCommentList(data);
    //     });

    //     return () => {
    //         try {
    //             unsubscribe.remove();
    //         } catch (error) { }
    //     }

    // }, []);





    // useEffect(() => {
    //     // if (userStore.me) {
    //     //     comments.getCommentsByUserId(userStore.me.id).then((data) => {
    //     //         setCommentList(data);
    //     //         setLoading(false);
    //     //     });
    //     // }
    // }, [userStore.me]);

    // useEffect(() => {
    //     const getLiveComments = async () => {
    //         try {
    //             const data = await comments.getCommentsByUserId(userStore.me.id);
    //             await commentStore.dumpUserComments(data);
    //             setCommentList([...data]);
    //         } catch (error) { }
    //     }

    //     getLiveComments();
    // }, []);



    const counterItem = (title, count) => {
        return (
            <View style={styles.counterItem}>
                <Text style={styles.counterItemCount}>{count}</Text>
                <Text style={styles.counterItemTitle}>{title}</Text>
            </View>
        );
    }

    const getProviderIcon = () => {
        switch (userStore.me?.lastProvider) {
            case 'google.com': return require('../assets/images/login-providers/google.png');
            case 'facebook.com': return require('../assets/images/login-providers/facebook.png');
            case 'apple.com': return require('../assets/images/login-providers/apple.png');
        }
    }

    const counterView = () => {
        return (
            <>
                {counterItem("Takipçi", userStore.me?.followingsCount)}
                {counterItem("Takip Edilen", userStore.me?.followersCount)}
                {counterItem("Paylaşım", userStore.me?.commentsCount)}
            </>
        );
    }

    return (
        !userStore.me ? <></> :
            <View style={styles.container}>
                <View style={styles.cover}>
                    <View style={styles.coverHack} />
                    <View style={styles.imageBox}>
                        {userStore.me.imageUri ?
                            <Image style={styles.image} source={{ uri: userStore.me.imageUri }} />
                            :
                            <Image style={styles.image} source={require('../assets/images/user/default.png')} />
                        }
                        <Image source={getProviderIcon()} style={styles.providerIcon} />
                    </View>
                </View>
                <View style={styles.header}>
                    <Text style={styles.name}>{userStore.me.name}</Text>
                    <Text style={styles.createdAt}>{i18n.t("txt_dateOfRegistration")}: <Text style={{ fontWeight: "bold" }}>{moment(userStore.me.created).format('DD MMMM YYYY')}</Text></Text>
                </View>
                <View style={styles.comments}>

                    <FlatList
                        data={commentList}
                        onRefresh={onRefresh}
                        style={styles.flatlist}
                        refreshing={refreshing}
                        initialNumToRender={10}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.5}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        ListFooterComponent={() => (<View style={{ height: 250 }} />)}
                        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                        ListHeaderComponent={() => (<View style={styles.counter}>{counterView()}</View>)}
                        renderItem={(data) => <CommentItem profileScreen={true} navigation={navigation} parity={data.item.parity} data={data.item} />}
                    />

                    {/* <FlatList
                        data={commentList}
                        style={styles.flatlist}
                        onEndReachedThreshold={0.5}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={async () => {
                            try {
                                setRefreshing(true);
                                const data = await comments.getCommentsByUserId(userStore.me.id);
                                await commentStore.dumpUserComments(data);
                                setCommentList([...data]);
                                setRefreshing(false);
                            } catch (error) {
                                console.log(error);
                                setRefreshing(false);
                            }
                        }}
                        ListHeaderComponent={() => (<View style={styles.counter}>{counterView()}</View>)}
                        initialNumToRender={10}
                        keyExtractor={(item, index) => index.toString()}
                        ListFooterComponent={() => (<View style={{ height: 250 }} />)}
                        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                        renderItem={(data) => <CommentItem profileScreen={true} navigation={navigation} parity={data.item.parity} data={data.item} />}
                        onEndReached={async () => {
                            const lastComment = commentList[commentList.length - 1];
                            const lastCommentCreatedAt = lastComment ? lastComment.createdAt : null;
                            try {
                                const data = await comments.getCommentsByUserId(userStore.me.id, lastCommentCreatedAt);
                                setCommentList([...commentList, ...data]);
                            } catch (error) { }
                            setLoading(false)
                        }}
                    /> */}
                </View>
            </View>
    );
};

export default ProfileScreen;