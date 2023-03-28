import { importer } from 'ipfs-unixfs-importer';
import { RecordsWrite } from '@tbd54566975/dwn-sdk-js';
import { DID, generateKeyPair } from '@decentralized-identity/ion-tools';

export async function generateChonkerRecordsWrite(asyncIterable) {
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
  const cid = await generateCid(asyncIterable);

  const record = await RecordsWrite.create({
    schema: 'test',
    dataCid: cid,
    dataFormat: 'application/json',
    authorizationSignatureInput: {
      privateJwk: kp.privateJwk,
      protectedHeader: { alg: 'ES256K', kid: `${longForm}#key-1` }
    }
  });

  return { did: longForm, record: record.toJSON() };
}

export async function generateCid(asyncIterable) {
  const jankStore = {
    put: () => {
      return;
    },
    get: () => {
      return;
    }
  }
  const imp = importer([{ content: asyncIterable }], jankStore, { cidVersion: 1 });


  let block;

  for await (block of imp) { ; }

  return block.cid.toString();
}