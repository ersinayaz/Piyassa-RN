import { DeviceData } from '../models/User';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { observable, action, makeAutoObservable, runInAction } from 'mobx';

export class DeviceStore {
    @observable info?: DeviceData;
    @observable permissions?: any;
    @observable ip?: array;
    @observable parities?: array = [];

    constructor() {
        makeAutoObservable(this, {
            info: observable,
            ip: observable,
            permissions: observable,
            parities: observable,
            setData: action,
            setIP: action,
            setPermissions: action,
            setParities: action,
        });
    }

    @action setParities(parities: array = []) {
        this.parities = parities;
    }

    @action setIP(ip: array) {
        this.ip = ip;
    }

    @action setData(info: DeviceData) {
        this.info = info;
    }

    @action setPermissions(permissions: any) {
        this.permissions = permissions;
    }
}

export default new DeviceStore();