import { Dwn } from '@tbd54566975/dwn-sdk-js';
import express from 'express';
import ContentType from 'content-type';
import cors from 'cors';
import busboy from 'busboy';
import EventEmitter from 'events';

const dwn = await Dwn.create({});
const app = express();
const emitter = new EventEmitter();

app.use(cors());

app.post('/', async (req, res) => {
  let dwnRequest = req.headers['dwn-message'];
  if (!dwnRequest) {
    // TODO: decide if we want to send a jsonrpc response back
    return res.sendStatus(400);
  }

  // TODO: handle parsing error
  dwnRequest = JSON.parse(dwnRequest);

  let contentType;
  if ('content-type' in req.headers) {
    contentType = ContentType.parse(req);
  }

  if (!contentType) {
    // this means there is no data associated to the message in the request body.
    const { params } = dwnRequest;
    const reply = await dwn.processMessage(params.target, params.message);
    const jsonRpcResponse = {
      jsonrpc: '2.0',
      id: dwnRequest.id,
      result: reply
    }

    return res.status(200).json(jsonRpcResponse);
  }

  // TODO: try/catch busboy. itll bork if content-type isnt supported 
  const bb = busboy({ headers: req.headers });
  const { id: requestId, params } = dwnRequest;

  emitter.once(requestId, reply => {
    const jsonRpcResponse = {
      jsonrpc: '2.0',
      id: dwnRequest.id,
      result: reply
    }

    return res.status(200).json(jsonRpcResponse);
  });

  bb.on('file', async (name, stream, info) => {
    const reply = await dwn.processMessage(params.target, params.message, stream);
    emitter.emit(requestId, reply);
  });

  bb.on('close', async () => {
    console.log('request body processing done');
  });

  req.pipe(bb);
});

app.listen(3000, () => {
  console.log('server listening on 3000');
});
