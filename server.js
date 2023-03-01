import { Dwn, RecordsWrite } from '@tbd54566975/dwn-sdk-js';
import express from 'express';
import { DID, generateKeyPair } from '@decentralized-identity/ion-tools';
import cors from 'cors';
import { PassThrough } from 'stream';
import { generateCid } from './multijank.js'


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

const jankStore = {
  put: () => {
    return;
  },
  get: () => {
    return;
  }
}

app.post('/', async (req, res) => {
  console.log(req.headers['content-type']);
  const cidPt = new PassThrough();
  const processMsgPt = new PassThrough();
  const agane = new PassThrough();

  // create (or "tee" in unix terms) two separate streams. 1 will be consumed to generate the CID.
  // the other will be consumed by `dwn.processMessage`
  req.pipe(cidPt)
  req.pipe(processMsgPt);

  // the result of logging this will yield a DIFFERENT CID than the
  console.log('normalizing stream. this CID won\'t match the next one', await generateCid(req));

  //! NOTE: This is a HACK. i am normalizing the `req` stream by consuming it. the result of 
  //!       consuming it and passing it through to other streams is that it removes
  //!       inconsistencies caused by sending bytes over the wire. 

  const cid = await generateCid(cidPt);

  console.log('this is normalized now. CID will always be consistent here on out', cid);

  const record = await RecordsWrite.create({
    schema: 'test',
    dataCid: cid,
    dataFormat: 'application/json',
    authorizationSignatureInput: {
      privateJwk: kp.privateJwk,
      protectedHeader: { alg: 'ES256K', kid: `${longForm}#key-1` }
    }
  });

  const result = await dwn.processMessage(longForm, record.toJSON(), processMsgPt);
  console.log(result);
  return res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('server listening on 3000');
});
