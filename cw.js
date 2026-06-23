/* =========================================================
cw.js
共通ライブラリ
========================================================= */

"use strict";

/* =========================================================
文字正規化
========================================================= */

function normalizeLongBar(text) {
return text.replace(/[-ｰ━─－―]/g, "ー");
}

function toFullWidthAscii(text) {
return text.replace(/[A-Za-z0-9]/g, s =>
String.fromCharCode(s.charCodeAt(0) + 0xFEE0)
);
}

function normalizeText(text) {

```
if (!text) return "";

text = text.normalize("NFKC");

text = normalizeLongBar(text);

text = toFullWidthAscii(text);

return text;
```

}

/* =========================================================
UTF8
========================================================= */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/* =========================================================
ArrayBuffer
========================================================= */

function concatBuffers(a, b) {

```
const c = new Uint8Array(a.length + b.length);

c.set(a, 0);
c.set(b, a.length);

return c;
```

}

/* =========================================================
HEX
========================================================= */

function bufferToHex(buffer) {

```
return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
```

}

/* =========================================================
SHA256
========================================================= */

async function sha256(text) {

```
const buf = encoder.encode(text);

const hash = await crypto.subtle.digest(
    "SHA-256",
    buf
);

return hash;
```

}

async function sha256Hex(text) {

```
const hash = await sha256(text);

return bufferToHex(hash);
```

}

/* =========================================================
AES Key
========================================================= */

async function createAesKeyFromAnswer(answerText) {

```
const hash = await sha256(answerText);

return await crypto.subtle.importKey(
    "raw",
    hash,
    {
        name: "AES-GCM"
    },
    false,
    [
        "encrypt",
        "decrypt"
    ]
);
```

}

/* =========================================================
Base64
========================================================= */

function bytesToBase64(bytes) {

```
let binary = "";

bytes.forEach(v => {
    binary += String.fromCharCode(v);
});

return btoa(binary);
```

}

function base64ToBytes(base64) {

```
const binary = atob(base64);

return Uint8Array.from(
    binary,
    c => c.charCodeAt(0)
);
```

}

/* =========================================================
Base64URL
========================================================= */

function toBase64Url(base64) {

```
return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
```

}

function fromBase64Url(base64url) {

```
let b64 = base64url
    .replace(/-/g, "+")
    .replace(/_/g, "/");

while (b64.length % 4) {
    b64 += "=";
}

return b64;
```

}

/* =========================================================
JSON → Base64URL
========================================================= */

function jsonToBase64Url(obj) {

```
const json = JSON.stringify(obj);

const bytes = encoder.encode(json);

const b64 = bytesToBase64(bytes);

return toBase64Url(b64);
```

}

function base64UrlToJson(text) {

```
const b64 = fromBase64Url(text);

const bytes = base64ToBytes(b64);

const json = decoder.decode(bytes);

return JSON.parse(json);
```

}

/* =========================================================
AES-GCM Encrypt
========================================================= */

async function encryptText(answerBoard, plainText) {

```
const key =
    await createAesKeyFromAnswer(answerBoard);

const iv = crypto.getRandomValues(
    new Uint8Array(12)
);

const encrypted =
    await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv
        },
        key,
        encoder.encode(plainText)
    );

const ivAndData =
    concatBuffers(
        iv,
        new Uint8Array(encrypted)
    );

return toBase64Url(
    bytesToBase64(ivAndData)
);
```

}

/* =========================================================
AES-GCM Decrypt
========================================================= */

async function decryptText(answerBoard, cipherText) {

```
try {

    const key =
        await createAesKeyFromAnswer(
            answerBoard
        );

    const bytes =
        base64ToBytes(
            fromBase64Url(cipherText)
        );

    const iv =
        bytes.slice(0, 12);

    const data =
        bytes.slice(12);

    const decrypted =
        await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv
            },
            key,
            data
        );

    return decoder.decode(decrypted);

} catch {

    return null;
}
```

}

/* =========================================================
URL Parameter
========================================================= */

function getQueryParam(name) {

```
const params =
    new URLSearchParams(
        location.search
    );

return params.get(name);
```

}

/* =========================================================
Puzzle Format
========================================================= */

function parsePuzzleText(text) {

```
const m =
    text.match(
        /^([A-Z0-9]+)【(\d+)x(\d+)\[(.*)\]([\s\S]*)】$/u
    );

if (!m) {
    throw new Error(
        "書式エラー"
    );
}

const version = m[1];
const width = parseInt(m[2], 10);
const height = parseInt(m[3], 10);

const board = normalizeText(m[4]);

const resultText = m[5];

if (
    board.length !==
    width * height
) {
    throw new Error(
        "盤面サイズ不一致"
    );
}

return {
    version,
    width,
    height,
    board,
    resultText
};
```

}

/* =========================================================
Grid Utility
========================================================= */

function boardToRows(board, width) {

```
const rows = [];

for (
    let i = 0;
    i < board.length;
    i += width
) {
    rows.push(
        board.substring(
            i,
            i + width
        )
    );
}

return rows;
```

}

/* =========================================================
Export
========================================================= */

window.CW = {

```
normalizeText,

sha256,
sha256Hex,

encryptText,
decryptText,

jsonToBase64Url,
base64UrlToJson,

getQueryParam,

parsePuzzleText,

boardToRows
```

};
