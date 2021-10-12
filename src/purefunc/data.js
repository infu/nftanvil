export const encodeArrayBuffer = (file) => Array.from(new Uint8Array(file));

export const jsonToNat8 = async (json) => {
  const bl = new Blob([JSON.stringify(json)], {
    type: "application/json",
  });
  const buffer = await bl.arrayBuffer();
  const arr = encodeArrayBuffer(buffer);
  return arr;
};
