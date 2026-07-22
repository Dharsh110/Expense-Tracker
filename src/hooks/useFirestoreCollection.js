import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
} from "../firebase/firebase";

import {
  migrateLocalDataToFirestore,
  subscribeToUserCollection,
} from "../services/firestoreData";

function useFirestoreCollection(
  collectionName,
  storageKey
) {
  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let unsubscribeSnapshot =
      null;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
          }

          if (!user) {
            const cachedItems =
              JSON.parse(
                localStorage.getItem(
                  storageKey
                )
              ) || [];

            setItems(cachedItems);
            setLoading(false);
            return;
          }

          setLoading(true);

          try {
            await migrateLocalDataToFirestore(
              collectionName,
              storageKey
            );

            unsubscribeSnapshot =
              subscribeToUserCollection(
                collectionName,
                (data) => {
                  setItems(data);
                  localStorage.setItem(
                    storageKey,
                    JSON.stringify(data)
                  );
                  setLoading(false);
                },
                (error) => {
                  console.error(error);
                  setLoading(false);
                }
              );
          } catch (error) {
            console.error(error);
            setLoading(false);
          }
        }
      );

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }

      unsubscribeAuth();
    };
  }, [collectionName, storageKey]);

  return {
    items,
    setItems,
    loading,
  };
}

export default useFirestoreCollection;
