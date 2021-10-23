export const encodeArrayBuffer = (file) => Array.from(new Uint8Array(file));

export const jsonToNat8 = async (json) => {
  const bl = new Blob([JSON.stringify(json)], {
    type: "application/json",
  });
  const buffer = await bl.arrayBuffer();
  const arr = encodeArrayBuffer(buffer);
  return arr;
};

export const chunkBlob = async (url) => {
  let blob = await fetch(url).then((x) => x.blob());
  let size = blob.size;
  let chunkSize = 1024 * 512;
  let chunks = Math.ceil(size / chunkSize);
  console.log("RC", blob, blob.size, chunks);
  let r = [];
  for (let i = 0; i < chunks; i++) {
    r.push(blob.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  return r;
};

export const blobPrepare = async (chunk) =>
  Array.from(new Uint8Array(await chunk.arrayBuffer()));
