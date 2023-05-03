import { reaction } from 'mobx';
import i18n from '../i18n/_i18n';
import { useStore } from '../store';
import { useFirestore } from '../db';
import { color } from '../assets/colors';
import ParityCard from '../components/ParityCard';
import CommentItem from '../components/CommentItem';
import useColorScheme from '../assets/useColorScheme';
import firestore from '@react-native-firebase/firestore';
import analytics from '@react-native-firebase/analytics';
import * as StoreReview from 'react-native-store-review';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState, useEffect, useRef } from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

interface ParityDetailScreenProps { navigation: any; route: any; }

const ParityDetailScreen = (props: ParityDetailScreenProps) => {
  const colorScheme = useColorScheme();
  const styles = StyleSheet.create({
    headerButton: {
      backgroundColor: color("color2"),
      borderRadius: 5,
      paddingVertical: 7.5,
      alignItems: "center",
      justifyContent: "center",
    },
    headerButtonText: {
      color: color("color6"),
      fontSize: 12,
      fontWeight: "bold",
    },
    background: {
      flex: 1,
      backgroundColor: color("color2"),
    },
    container: {
      flex: 1,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingVertical: 5,
      backgroundColor: color("color6"),
    },
    flatlist: {
      flex: 1,
    },
    itemSeparator: {
      height: .7,
      backgroundColor: color("color5"),
    },
    btnNewComment: {
      right: 20,
      width: 50,
      bottom: 20,
      height: 50,
      borderRadius: 25,
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: color("color8")
    },
    loading: {
      position: "absolute",
      top: 73.5,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: color("color6"),
      opacity: 9,
      zIndex: 99999,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    header: {
      height: 50,
      borderTopWidth: .7,
      paddingHorizontal: 20,
      borderBottomWidth: .7,
      justifyContent: "center",
      borderTopColor: color("color5"),
      borderBottomColor: color("color5")
    },
    headerTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: color("color8")
    },
  });
  const flatListRef = useRef(null);
  const parity = props.route.params?.data;
  const { userStore, feedStore } = useStore();
  const { comments, users } = useFirestore();
  const [refreshing, setRefreshing] = useState(false);
  const [newCommentsCount, setNewCommentsCount] = useState(0);

  const [data, setData] = useState(feedStore.feed[parity.id] || []);

  useEffect(() => {
    const reaction1 = reaction(() => feedStore.feed[parity.id], (feed, prev) => {
      if (JSON.stringify(feed) === JSON.stringify(prev)) return;
      setData(feed);
    });
    return () => reaction1();
  }, [feedStore.feed[parity.id]]);

  useEffect(() => {
    const updateHeader = async () => {
      props.navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity onPress={() => { props.navigation.goBack(); }} style={{ backgroundColor: color("color1"), marginTop: -10, marginLeft: 16, width: 36, height: 36, justifyContent: "center", alignItems: "center", borderRadius: 5, zIndex: 2 }}>
            <FontAwesome5 color={color("buttonText")} name="chevron-left" size={16} />
          </TouchableOpacity>
        ),
      });
    }

    updateHeader();

    const fetchData = async () => {
      const response = await comments.getComments(parity.id);
      if (response) {
        if (JSON.stringify(response) !== JSON.stringify(feedStore.feed[parity.id])) {
          await feedStore.dumpFeedByParityId(parity.id, response);
          await feedStore.getFeedByParityId(parity.id);
          setData(response);
        }
      }
    }

    const sendAnalytics = async () => {
      await analytics().logViewItemList({
        item_list_id: parity.id,
        item_list_name: parity.name
      });
    }

    fetchData();
    sendAnalytics();
  }, []);

  useEffect(() => {
    const collectionRef = firestore().collection('comments').orderBy('createdAt').startAt(Date.now());
    const unsubscribe = collectionRef.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          if (change.doc.data().parity.id === parity.id && change.doc.data().user.id !== userStore.me?.id) {
            setNewCommentsCount((prevCount) => prevCount + 1);
          }
        }
      });
    });

    return () => {
      setNewCommentsCount(0);
      unsubscribe();
    };
  }, []);

  // useEffect(() => {
  //   if (newCommentsCount > 0) {
  //     console.log("newCommentsCount", newCommentsCount);
  //   }
  // }, [newCommentsCount]);


  const onRefresh = async () => {
    setRefreshing(true);
    setNewCommentsCount(0);

    const response = await comments.getComments(parity.id);
    if (response) {
      if (JSON.stringify(response) !== JSON.stringify(feedStore.feed[parity.id])) {
        await feedStore.dumpFeedByParityId(parity.id, response);
        await feedStore.getFeedByParityId(parity.id);
        setData(response);
        flatListRef.current.scrollToIndex({ index: 0, animated: true });
      }
    }
    setRefreshing(false);
  }

  const onEndReached = async () => {
    if (feedStore.feed[parity.id].length > 0) {
      const lastComment = data[data.length - 1];
      const lastCommentCreatedAt = lastComment ? lastComment.createdAt : null;
      const response = await comments.getComments(parity.id, lastCommentCreatedAt);
      setData([...data, ...response]);
    }
  }

  const newComment = () => {
    if (!userStore.me) return props.navigation.navigate('Login', { navigation: props.navigation, parity, from: "ParityDetail" });

    if (userStore.me.name == null || userStore.me.name.length == 0) {
      Alert.prompt(i18n.t("lbl_emptyname_title"), i18n.t("lbl_emptyname_description"),
        [
          {
            text: i18n.t('btn_save'),
            onPress: async (text: string) => {
              const u = userStore.me;
              u.name = text;
              await userStore.setUser(u);
              users.update(userStore.me.id, { name: text });
              openNewCommentPopup();
            }
          },
          { text: i18n.t('btn_cancel'), style: "cancel" }
        ],
        'plain-text', '', 'default'
      );
    }
    else {
      openNewCommentPopup();
    }
  }

  const loadNewComments = async () => {
    setNewCommentsCount(0);

    const response = await comments.getComments(parity.id);
    if (response) {
      if (JSON.stringify(response) !== JSON.stringify(feedStore.feed[parity.id])) {
        await feedStore.dumpFeedByParityId(parity.id, response);
        await feedStore.getFeedByParityId(parity.id);
        setData(response);
        flatListRef.current.scrollToIndex({ index: 0, animated: true });
      }
    }
  }

  const openNewCommentPopup = async () => {
    props.navigation.navigate('TextArea', {
      title: i18n.t('txt_newComment'),
      placeholder: i18n.t('txt_newCommentPlaceholder'),
      buttonTitle: i18n.t('btn_newCommentSend'),
      extraData: { parity: parity },
      buttonLeftImage: parity.image,
      onSuccess: async (text: string, extraData?: any) => {
        props.navigation.navigate('ParityDetail', { navigation: props.navigation, data: extraData.parity })

        const addedComment = await comments.create({
          body: text.toString(),
          isDeleted: false,
          likeCount: 0,
          parity: {
            id: parity.id,
            price: parity.price
          },
          user: {
            id: userStore.me.id,
            name: userStore.me.name,
            email: userStore.me.email,
            imageUri: userStore.me.imageUri
          }
        });

        await analytics().logEvent("comment_add", {
          parity_id: parity.id,
          parity_name: parity.name,
          user_id: userStore.me.id,
          user_name: userStore.me.name,
          content: text
        });

        const nUser = userStore.me;
        nUser.commentsCount++;
        userStore.setUser(nUser);
        users.update(userStore.me.id, { commentsCount: nUser.commentsCount });
        if (nUser === 3) {
          StoreReview.requestReview();
        }

        // setData(feedStore.feed[parity.id]);
        // await commentStore.addComment(addedComment);
        const response = await comments.getComments(parity.id);
        if (response) {
          if (JSON.stringify(response) !== JSON.stringify(feedStore.feed[parity.id])) {
            await feedStore.dumpFeedByParityId(parity.id, response);
            await feedStore.getFeedByParityId(parity.id);
            await feedStore.addUserComment(addedComment);
            await feedStore.getUserComments();
            setData(response);
          }
        }
        flatListRef.current.scrollToIndex({ index: 0, animated: true });
      }
    });
  }

  return (
    <>
      <View style={styles.background}>
        <View style={styles.container}>
          <ParityCard data={parity} navigation={props.navigation} />
          <View style={styles.header}>
            {
              newCommentsCount == 0 ?
                <Text style={styles.headerTitle}>{i18n.t("lbl_UserReviews")}</Text>
                :
                <TouchableOpacity onPress={loadNewComments} style={styles.headerButton}>
                  <Text style={styles.headerButtonText}>{newCommentsCount}{" Yeni Gönderi"}</Text>
                </TouchableOpacity>
            }
          </View>
          <FlatList
            data={data}
            ref={flatListRef}
            onRefresh={onRefresh}
            style={styles.flatlist}
            refreshing={refreshing}
            initialNumToRender={10}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            ListFooterComponent={() => (<View style={{ height: 5 }} />)}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            renderItem={({ item }) => <CommentItem data={item} navigation={props.navigation} parity={parity} profileScreen={false} />}
          />
          <TouchableOpacity activeOpacity={.9} onPress={newComment} style={styles.btnNewComment}>
            <Ionicons name="ios-add" size={25} color={color("color6")} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default ParityDetailScreen;