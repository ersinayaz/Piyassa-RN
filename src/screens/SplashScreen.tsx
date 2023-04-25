import moment from 'moment';
import i18n from '../i18n/_i18n';
import { useStore } from '../store';
import { useFirestore } from '../db';
import { observer } from 'mobx-react';
import { color } from '../assets/colors';
import { DeviceData, Parities } from '../models';
import DeviceInfo from 'react-native-device-info';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, AppState } from 'react-native';


const SplashScreen = observer(({ navigation }) => {

  const { deviceStore, userStore } = useStore();
  const { parities, relationships } = useFirestore();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const init = async () => {
      const deviceData = await getDeviceData();
      const ipData = await getIP();
      const parities = await getParities();
      const followings = await getFollowings();
      const data = {
        ip: ipData,
        user: userStore.me,
        parities: parities,
        deviceInfo: deviceData,
      };
      setInitialData(data);
    }
    init();
  }, []);

  const getParities = async () => {
    const firebaseData = await parities.toList();

    return Parities.map(p => {
      const dbData = firebaseData.find(f => f.id === p.id);
      return {
        ...p,
        price: dbData?.price,
        closingPrice: dbData?.closingPrice,
      }
    });
  }

  const getFollowings = async () => {
    if (!userStore.me) return;
    const followings = await relationships.getRelationships(userStore.me.id);
    userStore.setRelationships(followings);
    return followings;
  }

  useEffect(() => {
    if (initialData) {
      deviceStore.setData(initialData.deviceInfo);
      deviceStore.setIP(initialData.ip);
      deviceStore.setParities(initialData.parities);


      navigation.replace("Tab");
    }
  }, [initialData]);

  const fetchPublicIp = async () => {
    let controller = new AbortController()
    setTimeout(() => controller.abort(), 2500);
    const resp = await fetch('https://api64.ipify.org', { signal: controller.signal });
    const text = await resp.text();
    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    return text;
  }

  const getIP = async () => {
    const publicIP = await fetchPublicIp().catch(e => { return "" });
    const localIP = await DeviceInfo.getIpAddress().then(ip => { return ip });
    return { publicIP, localIP };
  }

  const getDeviceData = async () => {
    const deviceData = {
      id: await DeviceInfo.getUniqueId(),
      carrier: await DeviceInfo.getCarrier(),
      os: await DeviceInfo.getSystemName(),
      deviceName: await DeviceInfo.getDeviceName(),
      brand: await DeviceInfo.getBrand(),
      model: await DeviceInfo.getModel(),
      hasNotch: await DeviceInfo.hasNotch(),
      isEmulator: await DeviceInfo.isEmulator(),
      isTablet: await DeviceInfo.isTablet(),
      timeZone: (moment().utcOffset() / 60).toString(),
    } as DeviceData;
    return deviceData;
  }

  return (
    <View style={styles.container} >
      <Image style={styles.image} source={require('../assets/images/logo/splash.png')} />
    </View>
  );
});

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color('color1'),
  },
  image: {
    flex: 2,
    width: 254,
    height: 68,
    resizeMode: 'contain',
  }
});
