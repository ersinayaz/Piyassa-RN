import i18n from '../i18n/_i18n';
import { useStore } from '../store';
import { useFirestore } from '../db';
import { color } from '../assets/colors';
import ParityCard from '../components/ParityCard';
import CommentItem from '../components/CommentItem';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState, useEffect, useRef } from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';

const ParityDetailScreen = ({ navigation, route }) => {
  const parity = route.params?.data;
  const { userStore } = useStore();
  const { comments, users } = useFirestore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentList, setCommentList] = useState([]);
  const flatListRef = useRef(null);


  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => { navigation.goBack(); }} style={{ backgroundColor: color("color1"), marginTop: -10, marginLeft: 16, width: 36, height: 36, justifyContent: "center", alignItems: "center", borderRadius: 5, zIndex: 2 }}>
          <FontAwesome5 color={color("buttonText")} name="chevron-left" size={16} />
        </TouchableOpacity>
      ),
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

    navigation.navigate('TextArea', {
      title: i18n.t('txt_newComment'),
      placeholder: i18n.t('txt_newCommentPlaceholder'),
      buttonTitle: i18n.t('btn_newCommentSend'),
      extraData: { parity: parity },
      buttonLeftImage: parity.image,
      onSuccess: async (text: string, extraData?: any) => {
        navigation.navigate('ParityDetail', { navigation, data: extraData.parity })

        await comments.create({
          body: text,
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

        userStore.me.commentsCount = userStore.me.commentsCount + 1;
        userStore.setUser(userStore.me);

        users.update(userStore.me.id, {
          commentsCount: userStore.me.commentsCount
        });

        const data = await comments.getComments(parity.id);
        setCommentList([...data]);
        flatListRef.current.scrollToIndex({ index: 0, animated: true });
      }
    });
  };

  return (
    <>
      <View style={styles.background}>
        <View style={styles.container}>
          <ParityCard data={parity} navigation={navigation} />
          <FlatList
            ref={flatListRef}
            data={commentList}
            style={styles.flatlist}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              const data = await comments.getComments(parity.id);
              setCommentList([...data]);
              setRefreshing(false);
            }}
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

export default ParityDetailScreen;

const styles = StyleSheet.create({
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
    backgroundColor: color("color3")
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
  }
});
