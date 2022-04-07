import { User } from 'discord.js';
import { Router, Request, Response } from 'express';
import request from 'request';

const router = Router();

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  let data = await req.funcs.runCache(
    `STEALTH:REQUESTS:DISCORD:V1:${id}`,
    async () => {
      return req.v1.discord.getUser(id);
    }
  );
  res.json(data);
});
router.get('/:id/avatar', async (req, res) => {
  let { format, size, dynamic = true, proxy }: any = req.query.items;
  format = dynamic ? undefined : format || 'png';
  let avatar = await req.funcs.runCache(
    `STEALTH:V1:DISCORD:USER:AVATARS:${format}:${req.params.id}`,
    async () => {
      let data = await req.v1.discord.client.users.fetch(req.params.id);
      return data.displayAvatarURL({ dynamic, format, size });
    }
  );
  if (proxy) return request.get(avatar + req.query.url).pipe(res);
  else res.send(avatar);
});
router.get('/:id/banner', async (req, res) => {
  let { format, size, dynamic = true, proxy }: any = req.query.items;
  format = dynamic ? undefined : format || 'png';
  let avatar = await req.funcs.runCache(
    `STEALTH:V1:DISCORD:USER:BANNERS:${format}:${req.params.id}`,
    async () => {
      let data = await req.v1.discord.client.users.fetch(req.params.id);
      if (!data.banner)
        data = await req.v1.discord.client.users.fetch(req.params.id, {
          force: true
        });
      return data.bannerURL({ dynamic, format });
    }
  );
  if (proxy) return request.get(avatar + req.query.url).pipe(res);
  else res.send(avatar);
});

export default router;
