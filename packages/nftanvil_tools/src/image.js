export const challengeDraw = (ctx, bitmap) => {
  const packedInBits = 16;
  const charWidthBits = 16;
  const packsPerChar = 16;
  const numChar = bitmap.length / packsPerChar;

  let w = numChar * charWidthBits;
  let h = charWidthBits;
  var imd = ctx.createImageData(w, h);

  let a = Array(h)
    .fill(0)
    .map((x) => Array(w).fill(0));

  let src = bitmap.map((x) => {
    let z = x.toString(2).padStart(16, 0);

    return z;
  });

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let ch = Math.floor(x / charWidthBits);
      let chp = y * 16 + (x % 16);
      let num = ch * packsPerChar + Math.floor(chp / packedInBits);
      a[y][x] = src[num][16 - (chp % 16)] == "1" ? 1 : 0;
      //   a[y][x] = Math.floor(Math.random() * 2);
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let p = (y * w + x) * 4;
      imd.data[p + 0] = 0;
      imd.data[p + 1] = 0;
      imd.data[p + 2] = 0;
      imd.data[p + 3] = a[y][x] ? 255 : 0;
    }
  }

  // img.data[z + 0] = 0;
  // img.data[z + 1] = 0;
  // img.data[z + 2] = 0;
  // img.data[z + 3] = n[b]*255;

  ctx.putImageData(imd, 0, 0);
};

export const resizeImage = (
  src,
  MAX_WIDTH,
  MAX_HEIGHT,
  crop = false,
  type = "image/jpeg"
) => {
  return new Promise((resolve) => {
    var img = new Image();
    const already_url =
      typeof src !== "object" ? src.startsWith("blob:") : false;

    img.onload = function () {
      // if (!already_url) URL.revokeObjectURL(tmpUrl);
      var canvas = document.createElement("canvas");

      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      var width = img.width;
      var height = img.height;

      var ctx2 = canvas.getContext("2d");

      if (!crop) {
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx2.drawImage(img, 0, 0, width, height);
      } else {
        let ratio = MAX_WIDTH / MAX_HEIGHT;
        let scale = MAX_WIDTH / width;
        if (height * scale < MAX_HEIGHT) scale = MAX_HEIGHT / height;
        width *= scale;
        height *= scale;

        canvas.width = MAX_WIDTH;
        canvas.height = MAX_HEIGHT;
        ctx2.drawImage(
          img,
          (MAX_WIDTH - width) / 2,
          (MAX_HEIGHT - height) / 2,
          width,
          height
        );
      }

      canvas.toBlob(
        function (blob) {
          let url = URL.createObjectURL(blob);
          // console.log("BLOB", blob);
          resolve({ type, size: blob.size, url });
        },
        type,
        0.95
      );
    };
    let tmpUrl = already_url ? src : URL.createObjectURL(src);
    img.src = tmpUrl;
  });
};

export const resizeImageP = (src, max_w, max_h, opts = false) => {
  return new Promise((resolve) => {
    resizeImage(src, max_w, max_h, opts, (resp) => {
      resolve(resp);
    });
  });
};

export const snapVideoImage = (video) => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  var image = canvas.toDataURL();
  var success = image.length > 100000;
  if (success) return image;
  else return false;
};

export const extractVideoThumb = (objurl) => {
  return new Promise(async (resolve, reject) => {
    const video = document.createElement("video");

    const capture = async () => {
      await delay(300);
      let img;
      if ((img = snapVideoImage(video))) {
        video.pause();
        video.removeEventListener("timeupdate", capture);
        let info = {
          img,
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
        };
        resolve(info);
      }
    };

    video.addEventListener("timeupdate", capture);
    video.src = objurl;

    video.muted = true;
    video.preload = "metadata";

    video.playsInline = true;
    video.play().catch((err) => {
      reject(err);
    });
  });
};

export const getImgSize = (src) => {
  return new Promise((resolve) => {
    var img = document.createElement("img");
    img.src = src;
    img.onload = function () {
      var w = img.width;
      var h = img.height;
      resolve({ w, h });
    };
  });
};

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const filesize2text = (bytes) => {
  let lbl;
  let val = bytes;
  let metrics = ["bytes", "kb", "mb", "gb", "tb"];
  let i;
  for (i = 0; i < metrics.length; i++) {
    if (val > 1000) val = Math.round(val / 100) / 10;
    else break;
  }
  lbl = metrics[i];

  return val + " " + lbl;
};
