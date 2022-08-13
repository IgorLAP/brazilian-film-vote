import { NextApiRequest, NextApiResponse } from "next";
import stream from "stream";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
  }

  const { list } = req.body;

  if (!list) {
    res.status(400).json({ error: "No list provided" });
  }

  let file = "";

  for (const i in list) {
    if (Number(i) === 0) {
      file += `tmdbID, Title\n${list[i].id}, ${list[i].name}\n`;
    } else {
      file += `${list[i].id}, ${list[i].name}\n`;
    }
  }

  try {
    const readStream = new stream.PassThrough();
    readStream.end(file);
    res.setHeader("Content-type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=file.csv");
    readStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
