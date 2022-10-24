import { Ed25519KeyIdentity } from "@dfinity/identity";

const athene_url = "http://localhost:3000";

const auth = {
  identity: false,
};

auth.authenticate = ({ mode = "dark", restore = false } = {}) => {
  return new Promise((resolve, reject) => {
    const elistener = (msg) => {
      if (!msg.isTrusted) return;
      if (msg.origin !== athene_url) return;

      auth.identity = Ed25519KeyIdentity.fromParsedJson(JSON.parse(msg.data));

      document.removeEventListener("message", elistener);
      resolve(auth.identity);
    };

    window.addEventListener("message", elistener, false);

    let popup = popupCenter({
      url: `${athene_url}/?mode=${mode}${restore ? "&restore=true" : ""}`,
      title: "VVV Identity",
      w: 437,
      h: 651,
    });
  });
};

const popupCenter = ({ url, title, w, h }) => {
  // Fixes dual-screen position                             Most browsers      Firefox
  const dualScreenLeft =
    window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop =
    window.screenTop !== undefined ? window.screenTop : window.screenY;

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth;

  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight;

  const left = (width - w) / 2 + dualScreenLeft;
  const top = (height - h) / 2 + dualScreenTop;
  const newWindow = window.open(
    url,
    title,
    `
    scrollbars=no,
    menubar=0,resizable=0,
    width=${w}, 
    height=${h}, 
    top=${top}, 
    left=${left}
    `
  );

  if (window.focus) newWindow.focus();
  return newWindow;
};

export { auth as default };
