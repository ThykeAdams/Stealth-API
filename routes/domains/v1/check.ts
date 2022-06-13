import { User } from 'discord.js';
import { Router, Request, Response } from 'express';
import request from 'request';
import fetch from 'node-fetch';

const router = Router();

router.get('/:domain', async (req, res) => {
  let domain = req.params.domain;
  let data = await req.funcs.runCache(
    `STEALTH:REQUESTS:DOMAINS:V1:${domain}`,
    async () => {
      return fetch(
        `https://www.hover.com/api/lookup?q=${encodeURIComponent(
          domain
        )}&return_key=s.a0e04140a1b2385e1087`
      ).then((r) => r.json());
    }
  );
  console.log(data);
  res.json({
    isTaken: data.taken.includes(domain),
    available_similar: data.results
      .slice(0, 5)
      .filter((d: any) => !data.taken.includes(d.domain))
  });
});

export default router;
