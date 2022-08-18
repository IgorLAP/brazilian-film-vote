import * as firebaseAdmin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

import serviceKey from "../../brazilian-film-vote-firebase-adminsdk.json";

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

const db = getFirestore();
const auth = firebaseAdmin.auth();

export { auth, db };
