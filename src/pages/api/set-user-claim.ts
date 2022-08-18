import { NextApiResponse, NextApiRequest } from "next";

import { auth } from "~/lib/firebase-admin";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
  }

  try {
    const { uid } = req.body;
    await auth.setCustomUserClaims(uid, { admin: true });
    res.end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
