import { Dwn } from '@tbd54566975/dwn-sdk-js';
import express from 'express';
import cors from 'cors';
import busboy from 'busboy';
import EventEmitter from 'events';

const dwn = await Dwn.create({});
const app = express();
const emitter = new EventEmitter();

app.use(cors());

app.post('/', async (req, res) => {
  const bb = busboy({ headers: req.headers });
  const targetDid = req.headers['did'];
  const message = req.headers['dwn-message'];
  const requestEvent = Date.now();

  emitter.once(requestEvent, (result) => {
    console.log(result);
    return res.status(result.status.code).json(result);
  });

  bb.on('file', async (name, stream, info) => {
    const result = await dwn.processMessage(targetDid, JSON.parse(message), stream);
    emitter.emit(requestEvent, result);
  });

  bb.on('close', async () => {
    console.log('request body processing done');
  });

  req.pipe(bb);
});

app.listen(3000, () => {
  console.log('server listening on 3000');
});
