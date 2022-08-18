import { NextApiResponse, NextApiRequest } from "next";

import { db, auth } from "~/lib/firebase-admin";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { uid, email, name, photoURL, role } = req.body;
    await db.collection("users").doc(uid).set({
      email,
      name,
      photoURL,
      role,
    });
    await auth.updateUser(uid, { displayName: name });
    res.status(201).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
