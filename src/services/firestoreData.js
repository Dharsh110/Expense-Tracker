import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/firebase";

const getUserCollection = (collectionName) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login to access your data.");
  }

  return collection(
    db,
    "users",
    user.uid,
    collectionName
  );
};

const getUserDoc = (collectionName, id) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login to access your data.");
  }

  return doc(
    db,
    "users",
    user.uid,
    collectionName,
    String(id)
  );
};

export const subscribeToUserCollection = (
  collectionName,
  onData,
  onError
) => {
  return onSnapshot(
    getUserCollection(collectionName),
    (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      onData(data);
    },
    onError
  );
};

export const getUserCollectionData = async (
  collectionName
) => {
  const snapshot = await getDocs(
    getUserCollection(collectionName)
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
};

export const addUserDocument = async (
  collectionName,
  data
) => {
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.id) {
    await setDoc(
      getUserDoc(collectionName, data.id),
      payload,
      { merge: true }
    );

    return String(data.id);
  }

  const docRef = await addDoc(
    getUserCollection(collectionName),
    payload
  );

  return docRef.id;
};

export const updateUserDocument = async (
  collectionName,
  id,
  data
) => {
  await updateDoc(
    getUserDoc(collectionName, id),
    {
      ...data,
      updatedAt: serverTimestamp(),
    }
  );
};

export const deleteUserDocument = async (
  collectionName,
  id
) => {
  await deleteDoc(
    getUserDoc(collectionName, id)
  );
};

export const clearUserCollection = async (
  collectionName
) => {
  const snapshot = await getDocs(
    getUserCollection(collectionName)
  );

  await Promise.all(
    snapshot.docs.map((item) =>
      deleteDoc(item.ref)
    )
  );
};

export const getUserProfile = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login to access your data.");
  }

  const snapshot = await getDoc(
    doc(db, "users", user.uid)
  );

  return snapshot.exists() ? snapshot.data() : null;
};

export const saveUserProfile = async (data) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login to access your data.");
  }

  await setDoc(
    doc(db, "users", user.uid),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const migrateLocalDataToFirestore = async (
  collectionName,
  storageKey
) => {
  const user = auth.currentUser;

  if (!user) {
    return;
  }

  const migrationKey = `firestoreMigrated_${user.uid}_${collectionName}`;

  if (localStorage.getItem(migrationKey)) {
    return;
  }

  const savedData =
    JSON.parse(
      localStorage.getItem(storageKey)
    ) || [];

  if (savedData.length > 0) {
    await Promise.all(
      savedData.map((item) =>
        addUserDocument(collectionName, item)
      )
    );
  }

  localStorage.setItem(migrationKey, "true");
};
