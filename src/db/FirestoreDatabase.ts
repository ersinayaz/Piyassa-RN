import ObjectID from 'bson-objectid';
import { User, Comment, Relationship, Parity } from '../models';
import firestore from '@react-native-firebase/firestore';

export class FirestoreDatabase<T> {
    collectionName: string;

    constructor(_collectionName: string) {
        console.info("Firestore initialized with collection: " + _collectionName);
        this.collectionName = _collectionName;
    }

    async create(data: T): T {
        if (!data.id)
            data.id = ObjectID().toHexString();
        if (!data.createdAt)
            data.createdAt = Date.now();

        return await firestore().collection(this.collectionName).doc(data.id).set(data)
            .then(() => {
                return data;
            })
            .catch((error) => {
                console.log(error, data);
                return null;
            });
    }

    async toList(): Promise<T[]> {
        const snapshot = await firestore().collection(this.collectionName).get();
        const result: T[] = [];

        snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.data();
            result.push(childData);
        });

        return result;
    }

    async update(id: string, data: T): T {
        return await firestore().collection(this.collectionName).doc(id).update(data)
            .then(() => {
                return data;
            })
            .catch((error) => {
                console.log(error, data);
                return null;
            });
    }

    async delete(id: string): boolean {
        return await firestore().collection(this.collectionName).doc(id).delete()
            .then(() => {
                return true;
            })
            .catch((error) => {
                console.log(error, data);
                return false;
            });
    }

    async getById(id: string): Promise<T> {
        return await firestore().collection(this.collectionName).doc(id).get()
            .then((documentSnapshot) => {
                if (documentSnapshot.exists) {
                    return documentSnapshot.data();
                }
            });

    }

    async onChange(callback: (id: string, data: T) => void): Promise<() => void> {
        return await firestore().collection(this.collectionName).onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'modified') {
                    callback(change.doc.id, change.doc.data());
                }
            });
        });
    }

    async onChangeById(id: string, callback: (data: T) => void): Promise<() => void> {
        return await firestore().collection(this.collectionName).doc(id).onSnapshot((snapshot) => {
            if (snapshot.exists) {

                callback(snapshot.data());
            }
        });
    }

    async onCreated(callback: (id: string, data: T) => void): Promise<() => void> {
        return await firestore().collection(this.collectionName).orderBy('createdAt').startAt(Date.now()).onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    callback(change.doc.id, change.doc.data());
                }
            });
        });
    }

    async getComments(id: string, lastRecordCreatedAt: number | null): Promise<T[]> {
        const snapshot = await firestore().collection(this.collectionName)
            .where('parity.id', '==', id)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .startAfter(lastRecordCreatedAt ? lastRecordCreatedAt : Date.now())
            .get();
        const result: T[] = [];

        snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.data();
            result.push(childData);
        });

        return result;
    }
}

export const users = new FirestoreDatabase<User>("users");
export const comments = new FirestoreDatabase<Comment>("comments");
export const relationships = new FirestoreDatabase<Relationship>("relationships");
export const parities = new FirestoreDatabase<Parity>("parities");


export type Firestore = {
    users: FirestoreDatabase<User>;
    comments: FirestoreDatabase<Comment>;
    relationships: FirestoreDatabase<Relationship>;
    parities: FirestoreDatabase<Parity>;
}

const firebaseFirestore: Firestore = {
    users,
    comments,
    relationships,
    parities
};

export default firebaseFirestore;