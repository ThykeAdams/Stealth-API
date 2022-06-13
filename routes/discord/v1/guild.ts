import { User } from 'discord.js';
import { Router, Request, Response } from 'express';
import request from 'request';

const router = Router();

router.get('/invites/:code', async (req, res) => {
  const code = req.params.code;
  let inviteData = await req.v1.discord.getInvite(code);
  res.json(inviteData);
});

export default router;
