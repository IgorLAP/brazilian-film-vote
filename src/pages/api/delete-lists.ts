import { NextApiResponse, NextApiRequest } from "next";

import { db } from "~/lib/firebase-admin";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
  }

  const { userID } = req.body;

  if (!userID) {
    res.status(400).json({ error: "missing parameters" });
    return;
  }

  try {
    const usersListsSnap = await db
      .collection("users")
      .doc(userID)
      .collection("lists")
      .get();
    const batch = db.batch();
    usersListsSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    batch.commit();
    res.end();
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};
