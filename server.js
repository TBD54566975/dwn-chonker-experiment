import { Dwn, RecordsWrite } from '@tbd54566975/dwn-sdk-js';
import express from 'express';
import { DID, generateKeyPair } from '@decentralized-identity/ion-tools';
import cors from 'cors';
import { PassThrough } from 'stream';
import { generateCid } from './multijank.js'
import busboy from 'busboy';
import fs from 'fs';

console.log(busboy);


const kp = await generateKeyPair();
console.log(kp);

const did = new DID({
  content: {
    publicKeys: [{
      id: 'key-1',
      type: 'JsonWebKey2020',
      publicKeyJwk: kp.publicJwk,
      purposes: ['authentication']
    }]
  }
});

const longForm = await did.getURI('long');

const dwn = await Dwn.create({});
const app = express();

app.use(cors());

app.post('/', async (req, res) => {
  const bb = busboy({ headers: req.headers });

  bb.on('file', async (name, stream, info) => {
    const cid = await generateCid(stream);
    console.assert(cid === req.headers['cid'], `${cid} does not match ${req.headers['cid']}`);

    // const record = await RecordsWrite.create({
    //   schema: 'test',
    //   dataCid: cid,
    //   dataFormat: 'application/json',
    //   authorizationSignatureInput: {
    //     privateJwk: kp.privateJwk,
    //     protectedHeader: { alg: 'ES256K', kid: `${longForm}#key-1` }
    //   }
    // });

    // const result = await dwn.processMessage(longForm, record.toJSON(), stream);
    // console.log(result);
  });

  bb.on('close', () => {
    return res.sendStatus(200);
  });

  req.pipe(bb);
});

app.listen(3000, () => {
  console.log('server listening on 3000');
});
