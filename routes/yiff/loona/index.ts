import { Router, Request } from 'express';
import request from 'request';
import Booru from 'booru';
import fetch from 'node-fetch';
const router = Router();

router.get('/:nsfw/random', async (req: Request, res) => {
  let nsfw = req.params.nsfw || true;
  let data = await req.funcs.runCache(
    `STEALTH:YIFF:LOONA:RANDOM:${nsfw}`,
    async () => {
      return fetch(
        `https://e621.net/posts.json?tags=loona_%28helluva_boss%29+rating%3A`
      ).then((r) => r.text());
    }
  );
  console.log(data);
  let urls = data.posts.map((d: any) => d.file.url);
  let randomURL = urls[Math.floor(Math.random() * urls.length)];
  request.get(randomURL).pipe(res);
});

export default router;
