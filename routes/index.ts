import { Router } from 'express';
import request from 'request';
import packageJSON from '../package.json';
const router = Router();

router.get('/', async (req, res) => {
  res.json({
    welcome: 'Welcome to the STEALTH API',
    version: packageJSON.version,
    description:
      "The STEALTH API is a simple and easy to use API for Multiple services including Discord, Spotify, and more. It's designed to be used by multiple services and is designed to be easy to use and extendable.",
    control: {
      description:
        'To unlock some of our more deep features, you will need an API token, that you can get from our Dashboard (WIP) Without an API token, you will only be able to see public data, no special features will be activated',
      dashboard: 'https://dash.stealth.dev/'
    }
  });
});

export default router;
