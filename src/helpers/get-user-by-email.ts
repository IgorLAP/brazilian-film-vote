import { collection, query, where, getDocs } from "firebase/firestore";

import { webDb } from "~/lib/firebase";

export async function getUserByEmail(email: string) {
  const docRef = collection(webDb, "users");
  const q = query(docRef, where("email", "==", email));
  const querySnap = await getDocs(q);
  const userDoc = querySnap.docs[0].data();
  return userDoc;
}
