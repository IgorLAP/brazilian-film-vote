import { FieldPath } from "firebase-admin/firestore";
import { NextApiResponse, NextApiRequest } from "next";

import { db } from "~/lib/firebase-admin";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
  }

  const { startAfter, startAt, endAt } = req.body;

  if (!startAfter && !startAt && !endAt) {
    res.status(400).json({ error: "missing params" });
  }

  try {
    if (startAfter) {
      const snapshot = await db
        .collection("general_list")
        .orderBy(FieldPath.documentId())
        .startAfter(startAfter)
        .limit(2)
        .get();

      res.json({
        page: snapshot.docs.map((i) => ({
          idListType: i.data().id_list_type.path,
          movies: i.data().movies,
          status: i.data().status,
        })),
      });
    }

    if (startAt && endAt) {
      const snapshot = await db
        .collection("general_list")
        .orderBy(FieldPath.documentId())
        .startAt(startAt)
        .endAt(endAt)
        .limit(2)
        .get();

      res.json({
        page: snapshot.docs.map((i) => ({
          idListType: i.data().id_list_type.path,
          movies: i.data().movies,
          status: i.data().status,
        })),
      });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
};
