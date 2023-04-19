import ObjectID from 'bson-objectid';
import { firebase } from '@react-native-firebase/database';
import { User, Comment, Relationship } from '../models';

export class RealtimeDatabase<T> {
    collectionName: string;

    constructor(_collectionName: string) {
        console.info("Realtime initialized with collection: " + _collectionName);
        this.collectionName = _collectionName;
    }

    async create(data: T): T {
        if (!data.id)
            data.id = ObjectID().toHexString();
        if (!data.createdAt)
            data.createdAt = Date.now();

        return await firebase.database().ref(`${this.collectionName}`).child(data.id).set(data)
            .then(() => {
                return data;
            })
            .catch((error) => {
                console.log(error, data);
                return null;
            });
    }

    async toList(): Promise<T[]> {
        const snapshot = await firebase.database().ref(this.collectionName).once('value');
        const result: T[] = [];

        snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.val();
            result.push(childData);
        });

        return result;
    }

    async update(id: string, data: T): T {
        return await firebase.database().ref(`${this.collectionName}/${id}`).update(data)
            .then(() => {
                return data;
            })
            .catch((error) => {
                console.log(error, data);
                return null;
            });
    }

    async delete(id: string): boolean {
        return await firebase.database().ref(`${this.collectionName}/${id}`).remove()
            .then(() => {
                return true;
            })
            .catch((error) => {
                console.log(error, data);
                return false;
            });
    }

    async getById(id: string): Promise<T> {
        const snapshot = await firebase.database().ref(`${this.collectionName}/${id}`).once('value');
        return snapshot.val();
    }

    async onChange(callback: (id: string, data: T) => void): Promise<() => void> {
        return await firebase.database().ref(this.collectionName).on('child_changed', (snapshot) => {
            callback(snapshot.key, snapshot.val());
        });
    }

    async onCreated(callback: (id: string, data: T) => void): Promise<() => void> {
        return await firebase.database().ref(this.collectionName).orderByChild("createdAt").startAt(Date.now()).on('child_added', (snapshot) => {
            callback(snapshot.key, snapshot.val());
        });
    }
}

export const users = new RealtimeDatabase<User>("users");
export const relationships = new RealtimeDatabase<Relationship>("relationships");
export const comments = new RealtimeDatabase<Comment>("comments");


export type Realtime = {
    users: RealtimeDatabase<User>;
    comments: RealtimeDatabase<Comment>;
    relationships: RealtimeDatabase<Relationship>;
}

const firebaseRealtime: Realtime = {
    users,
    comments,
    relationships,
};

export default firebaseRealtime;