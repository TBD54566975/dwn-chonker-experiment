import { importer } from 'ipfs-unixfs-importer';

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