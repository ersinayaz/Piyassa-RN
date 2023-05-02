import { useStore } from '../store';
import { color } from '../assets/colors';
import React, { useEffect, useRef } from 'react';
import ParityCard from '../components/ParityCard';
import useColorScheme from '../assets/useColorScheme';
import messaging from '@react-native-firebase/messaging';
import { View, StyleSheet, FlatList } from 'react-native';
import NotificationModal from '../components/NotificationModal';
import BottomDrawer, { BottomDrawerMethods } from 'react-native-animated-bottom-drawer';

const HomeScreen = ({ navigation }) => {
    const { deviceStore } = useStore();
    const notificationModal = useRef<BottomDrawerMethods>(null);
    const colorScheme = useColorScheme();
    const styles = StyleSheet.create({
        background: {
            flex: 1,
            backgroundColor: color("color2"),
        },
        container: {
            flex: 1,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: color("color6"),
        },
        flatlist: {
            flex: 1,
            marginTop: 5
        },
        itemSeparator: {
            height: .7,
            backgroundColor: color("color5"),
        },
    });
    
    useEffect(() => {

        const notificationCheck = async () => {
            const messagingStatus = await messaging().hasPermission();
            if (messagingStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
                notificationModal.current?.open();
            }
        }


        notificationCheck();
    }, []);

    return (
        <>
            <View style={styles.background}>
                <View style={styles.container}>
                    <FlatList
                        style={styles.flatlist}
                        data={deviceStore.parities}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        ListFooterComponent={() => (<View style={{ height: 5 }} />)}
                        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                        renderItem={(data) => <ParityCard data={data.item} navigation={navigation} />}
                    />
                </View>
            </View>
            <BottomDrawer customStyles={{ container: { backgroundColor: color("color6") } }} ref={notificationModal} initialHeight={350}>
                <NotificationModal modalRef={notificationModal} />
            </BottomDrawer>
        </>
    );
};

export default HomeScreen;