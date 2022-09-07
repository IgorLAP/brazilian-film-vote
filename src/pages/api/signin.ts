import { NextApiResponse, NextApiRequest } from "next";

import { adminDb, auth } from "~/lib/firebase-admin";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
  }

  const { uid, email, name, photoURL, role, createdAt } = req.body;
  const required = [uid, email, name, role, createdAt];

  for (const item of required) {
    if (!item) {
      res.status(400).json({ error: "missing parameters" });
      return;
    }
  }

  try {
    await adminDb.collection("users").doc(uid).set({
      email,
      name,
      photoURL,
      role,
      createdAt,
    });
    await auth.updateUser(uid, { displayName: name });
    res.status(201).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
