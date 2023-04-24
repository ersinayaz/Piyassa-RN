import ObjectID from 'bson-objectid';
import firestore from '@react-native-firebase/firestore';
import { User, Comment, Relationship, Parity, Reports } from '../models';

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

    async getRelationships(followerId: string): Promise<T[]> {
        const snapshot = await firestore().collection(this.collectionName)
            .where('followerId', '==', followerId)
            .orderBy('createdAt', 'desc')
            .get();
        const result: T[] = [];

        snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.data();
            result.push(childData);
        });

        return result;
    }

    async checkUserExist(email: string): Promise<T> {
        const snapshot = await firestore().collection(this.collectionName)
            .where('email', '==', email)
            .get();

        const result: T[] = [];

        snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.data();
            result.push(childData);
        });

        if(result.length > 0)
            return result[0];
        else
        return null;
    }

}

export const users = new FirestoreDatabase<User>("users");
export const reports = new FirestoreDatabase<Reports>("reports");
export const parities = new FirestoreDatabase<Parity>("parities");
export const comments = new FirestoreDatabase<Comment>("comments");
export const relationships = new FirestoreDatabase<Relationship>("relationships");


export type Firestore = {
    users: FirestoreDatabase<User>;
    reports: FirestoreDatabase<Reports>;
    parities: FirestoreDatabase<Parity>;
    comments: FirestoreDatabase<Comment>;
    relationships: FirestoreDatabase<Relationship>;
}

const firebaseFirestore: Firestore = {
    users,
    reports,
    comments,
    parities,
    relationships
};

export default firebaseFirestore;