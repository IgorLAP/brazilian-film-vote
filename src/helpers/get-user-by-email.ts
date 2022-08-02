import { collection, query, where, getDocs } from "firebase/firestore";

import { db } from "~/lib/firebase";

export async function getUserByEmail(email: string) {
  const docRef = collection(db, "users");
  const q = query(docRef, where("email", "==", email));
  const querySnap = await getDocs(q);
  const userDoc = querySnap.docs[0].data();
  return userDoc;
}
