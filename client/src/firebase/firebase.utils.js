import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

var config = {
  apiKey: "AIzaSyAbP3p82uHLWL5yN0fo-pyPj1wPFbWWNBU",
  authDomain: "cloth-shop-crwn.firebaseapp.com",
  databaseURL: "https://cloth-shop-crwn.firebaseio.com",
  projectId: "cloth-shop-crwn",
  storageBucket: "cloth-shop-crwn.appspot.com",
  messagingSenderId: "177067733331",
  appId: "1:177067733331:web:99de8eb2b2b149ad3eb1a6",
  measurementId: "G-8LQXDP8KHY"
};

firebase.initializeApp(config);

export const createUserProfileDocument = async (userAuth, additionalData) => {
  if (!userAuth) return;

  const userRef = firestore.doc(`users/${userAuth.uid}`);

  const snapShot = await userRef.get();

  if (!snapShot.exists) {
    const { displayName, email } = userAuth;
    const createdAt = new Date();
    try {
      await userRef.set({
        displayName,
        email,
        createdAt,
        ...additionalData
      });
    } catch (error) {
      console.log('error creating user', error.message);
    }
  }

  return userRef;
};

export const getUserCartRef = async userId => {
  const cartsRef = firestore.collection('carts').where('userId', '==', userId);
  const snapShot = await cartsRef.get();

  if (snapShot.empty) {
    const cartDocRef = firestore.collection('carts').doc();
    await cartDocRef.set({ userId, cartItems: [] });
    return cartDocRef;
  } else {
    return snapShot.docs[0].ref;
  }
};

export const addCollectionAndDocuments = async (
  collectionKey,
  objectsToAdd
) => {
  const collectionRef = firestore.collection(collectionKey);

  const batch = firestore.batch();
  objectsToAdd.forEach(obj => {
    const newDocRef = collectionRef.doc();
    batch.set(newDocRef, obj);
  });

  return await batch.commit();
};

export const convertCollectionsSnapshotToMap = collections => {
  const transformedCollection = collections.docs.map(doc => {
    const { title, items } = doc.data();

    return {
      routeName: encodeURI(title.toLowerCase()),
      id: doc.id,
      title,
      items
    };
  });

  return transformedCollection.reduce((accumulator, collection) => {
    accumulator[collection.title.toLowerCase()] = collection;
    return accumulator;
  }, {});
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(userAuth => {
      unsubscribe();
      resolve(userAuth);
    }, reject);
  });
};

export const auth = firebase.auth();
export const firestore = firebase.firestore();

export const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const signInWithGoogle = () => auth.signInWithPopup(googleProvider);

export default firebase;
