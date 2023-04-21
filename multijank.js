import { RecordsWrite, EventsGet, Cid } from '@tbd54566975/dwn-sdk-js';
import { DID, generateKeyPair } from '@decentralized-identity/ion-tools';

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
const authorizationSignatureInput = {
  privateJwk: kp.privateJwk,
  protectedHeader: { alg: 'ES256K', kid: `${longForm}#key-1` }
};

export async function generateEventsGetMessage() {
  const eventsGet = await EventsGet.create({ authorizationSignatureInput });

  return { did: longForm, message: eventsGet.toJSON() }
}

export async function generateChonkerRecordsWrite(asyncIterable, dataSize) {
  const record = await RecordsWrite.create({
    schema: 'test',
    dataCid: await Cid.computeDagPbCidFromStream(asyncIterable),
    dataSize: dataSize,
    dataFormat: 'application/json',
    authorizationSignatureInput: authorizationSignatureInput
  });

  return { did: longForm, record: record.toJSON() };
}