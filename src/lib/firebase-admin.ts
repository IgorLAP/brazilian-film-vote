import * as firebaseAdmin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const serviceKey = JSON.parse(process.env.FIREBASE_ADMIN_SDK as string);

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      privateKey: serviceKey.private_key,
      clientEmail: serviceKey.client_email,
      projectId: serviceKey.project_id,
    }),
    databaseURL: `https://${serviceKey.project_id}.firebaseio.com`,
  });
}

const adminDb = getFirestore();
const auth = firebaseAdmin.auth();

export { auth, adminDb };
