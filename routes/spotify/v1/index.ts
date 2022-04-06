import { User } from 'discord.js';
import { Router, Request, Response } from 'express';
import request from 'request';

const router = Router();

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  let data = await req.v1.spotify.getTrack(id);
  res.json(data);
});

export default router;
