import { reaction } from 'mobx';
import i18n from '../i18n/_i18n';
import { useStore } from '../store';
import { useFirestore } from '../db';
import { color } from '../assets/colors';
import ParityCard from '../components/ParityCard';
import CommentItem from '../components/CommentItem';
import useColorScheme from '../assets/useColorScheme';
import analytics from '@react-native-firebase/analytics';
import * as StoreReview from 'react-native-store-review';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState, useEffect, useRef } from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

const ParityDetailScreen2 = ({ navigation, route }) => {
  const parity = route.params?.data;
  const { userStore, commentStore } = useStore();
  const { comments, users } = useFirestore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentList, setCommentList] = useState(commentStore[parity.id]);
  const flatListRef = useRef(null);
  const [newComments, setNewComments] = useState([]);
  const [newCommentsCount, setNewCommentsCount] = useState(0);
  const [newCommentsVisible, setNewCommentsVisible] = useState(false);

  
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => { navigation.goBack(); }} style={{ backgroundColor: color("color1"), marginTop: -10, marginLeft: 16, width: 36, height: 36, justifyContent: "center", alignItems: "center", borderRadius: 5, zIndex: 2 }}>
          <FontAwesome5 color={color("buttonText")} name="chevron-left" size={16} />
        </TouchableOpacity>
      ),
    });

    reaction(() => commentStore[parity.id], async (data, prev) => {
      setCommentList(data);
    });


    // reaction(() => userStore.me?.commentsCount, async (data, prev) => {
    //   if (data < prev) {
    //     const data = await comments.getComments(parity.id);
    //     setCommentList(data);
    //   }
    // });

    // const test = {
    //   id: "test",
    //   createdAt: Date.now(),
    //   body: "t-"+Math.random().toString(36).substring(7),
    //   isDeleted: false,
    //   likeCount: 0,
    //   parity: {
    //     id: parity.id,
    //     price: 0
    //   },
    //   user: {
    //     id: userStore.me.id,
    //     name: userStore.me.name,
    //     email: userStore.me.email,
    //     imageUri: userStore.me.imageUri
    //   }
    // };

    // commentStore.getUserComments().then((data) => {
    //   // console.log("data", data);
    //   // commentStore.dumpUserComments(data.slice(0, 10))
    // });
    // // commentStore.deleteUserComment("test");

    // commentStore.addComment(test);
    // console.log("added", test);


    analytics().logViewItemList({
      item_list_id: parity.id,
      item_list_name: parity.name
    });

  }, []);

  useEffect(() => {
    const getLiveComments = async () => {
      try {
        const data = await comments.getComments(parity.id);
        await commentStore.dumpComments(parity.id, data);
        setCommentList([...data]);
      } catch (error) { }
    }

    getLiveComments();

    return () => {
      setCommentList([]);
    }
  }, []);

  useEffect(() => {
    comments.onCreated((id, data) => {
      if (data.parity.id == parity.id) {
        if (data.user.id == userStore.me?.id) return;

        setNewCommentsCount((prevCount) => prevCount + 1);
        setNewCommentsVisible(true);
      }
    });

  }, []);


  const renderItem = ({ item }) => {
    return (
      <View style={{ paddingHorizontal: 20, minHeight: 120, justifyContent: "center" }}>
        <Text style={styles.itemText}>{item.body}</Text>
      </View>
    );
  };

  const newComment = async () => {
    if (!userStore.me) return navigation.navigate('Login', { navigation, parity, from: "ParityDetail" });

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
  };

  const openNewCommentPopup = async () => {
    navigation.navigate('TextArea', {
      title: i18n.t('txt_newComment'),
      placeholder: i18n.t('txt_newCommentPlaceholder'),
      buttonTitle: i18n.t('btn_newCommentSend'),
      extraData: { parity: parity },
      buttonLeftImage: parity.image,
      onSuccess: async (text: string, extraData?: any) => {
        navigation.navigate('ParityDetail', { navigation, data: extraData.parity })

        const addedComment = await comments.create({
          body: text[0],
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
 
        userStore.me.commentsCount = userStore.me.commentsCount + 1;
        userStore.setUser(userStore.me);

        users.update(userStore.me.id, {
          commentsCount: userStore.me.commentsCount
        });

        if (userStore.me.commentsCount === 3) {
          StoreReview.requestReview();
        }

        // const data = await comments.getComments(parity.id);
        // setCommentList([...data]);
        await commentStore.addComment(addedComment);
        flatListRef.current.scrollToIndex({ index: 0, animated: true });
      }
    });
  }

  const loadNewComments = async () => {
    const data = await comments.getComments(parity.id);
    await commentStore.dumpComments(parity.id, data);
    // setNewComments([]);
    setCommentList([...data]);
    setNewCommentsCount(0);
    setNewCommentsVisible(false);
    flatListRef.current.scrollToIndex({ index: 0, animated: true });
  }

  return (
    <>
      <View style={styles.background}>
        <View style={styles.container}>
          <ParityCard data={parity} navigation={navigation} />
          <View style={styles.header}>
            {
              newCommentsVisible == false ?
                <Text style={styles.headerTitle}>{i18n.t("lbl_UserReviews")}</Text>
                :
                <TouchableOpacity onPress={loadNewComments} style={styles.headerButton}>
                  <Text style={styles.headerButtonText}>{newCommentsCount}{" Yeni Gönderi"}</Text>
                </TouchableOpacity>
            }
          </View>
          <FlatList
            ref={flatListRef}
            data={commentList}
            style={styles.flatlist}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={async () => {
              try {
                setRefreshing(true);
                const data = await comments.getComments(parity.id);
                await commentStore.dumpComments(parity.id, data);
                setCommentList([...data]);
                setRefreshing(false);
                setNewCommentsCount(0);
                setNewCommentsVisible(false);
              } catch (error) {
                console.log(error);
                setRefreshing(false);
              }
            }}
            initialNumToRender={10}
            keyExtractor={(item, index) => index.toString()}
            ListFooterComponent={() => (<View style={{ height: 5 }} />)}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            renderItem={(data) => <CommentItem profileScreen={false} navigation={navigation} parity={parity} data={data.item} />}
            onEndReached={async () => {
              const lastComment = commentList[commentList.length - 1];
              const lastCommentCreatedAt = lastComment ? lastComment.createdAt : null;
              const data = await comments.getComments(parity.id, lastCommentCreatedAt);
              setCommentList([...commentList, ...data]);
              setTimeout(() => {
                setLoading(false);
              }, 1);
            }}
          />
          {loading ?
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={color("color7")} />
            </View> :
            null
          }

          <TouchableOpacity activeOpacity={.9} onPress={newComment} style={styles.btnNewComment}>
            <Ionicons name="ios-add" size={25} color={color("color6")} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default ParityDetailScreen2;
