const axios = require("axios");
const crypto = require("crypto-js");
const fs = require("node:fs");
const dotenv = require("dotenv");
dotenv.config();

let data = fs.createReadStream("s.rar", {
  start: 100000001,
  end: 200000000,
});
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESSKEY;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRETKEY;
const region = "auto";
const service = "s3";
const host = process.env.CLOUDFLARE_R2_HOST; // Replace with your Cloudflare account ID
const method = "PUT";
const uploadid =
  "AIyTdVInsAibY-zyplMgqmG3TofHhrLOdIQdNCm_LMZlpKtydKQxsCAviCI8avJY0j-ds1gd1Cuh1Ooy6s9ghW5XKFq3S3s2bcPQSDZhx3O2oiSLzI7-YA_6X4ws7C3XY83T2wOdZTZcWK4nb3IoS3jy_-lbBqicW5ATmonZduFD6y_h1HyS4-W_BXaMWol7EcdoD8D-QuZMDApFnhZheGQEAaUe5M9_SvJMZfNyeSR0hV8GAo1AB6AivDMQkglbX3WOvGyY_XAKR_6OZGxe6OXg1hnki7muh_eN3xzgfTs48VxklXFyFXfSDd_RKQWT_RiN3PDli1iXZeGXXryrbuM";
let da = [];
var payloadHash = "";
data.on("data", (chunk) => {
  da.push(chunk);
});
data.on("end", async () => {
  const buff = Buffer.concat(da);
  const word = crypto.lib.WordArray.create(buff);
  const hash = crypto.SHA256(word).toString(crypto.enc.Hex);
  payloadHash = hash;
  const currentDate = new Date();

  const amzDate =
    currentDate
      .toISOString()
      .replace(/[:-]|\.\d{3}/g, "")
      .substr(0, 15) + "Z";
  const dateStamp = amzDate.substr(0, 8);

  const canonicalUri = `/thunder-streams/s.rar`;
  const q = `partNumber=2&uploadId=${uploadid}`;
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${hash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = `${method}\n${canonicalUri}\n${q}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto
    .SHA256(canonicalRequest)
    .toString(crypto.enc.Hex)}`;
  function getSignatureKey(key, dateStamp, regionName, serviceName) {
    const kDate = crypto.HmacSHA256(dateStamp, "AWS4" + key);
    const kRegion = crypto.HmacSHA256(regionName, kDate);
    const kService = crypto.HmacSHA256(serviceName, kRegion);
    const kSigning = crypto.HmacSHA256("aws4_request", kService);
    return kSigning;
  }
  const signingKey = getSignatureKey(
    secretAccessKey,
    dateStamp,
    region,
    service
  );
  const signature = crypto
    .HmacSHA256(stringToSign, signingKey)
    .toString(crypto.enc.Hex);

  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  let dat = fs.createReadStream("s.rar", {
    start: 100000001,
    end: 200000000,
  });
  let config = {
    method: "PUT",
    url: `${process.env.CLOUDFLARE_R2_ACCOUNT_ID}/thunder-streams/s.rar?partNumber=2&uploadId=${uploadid}`,
    headers: {
      Authorization: authorizationHeader,
      Host: host,
      "Content-Type": "application/octet-stream",
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      "Content-Length": `${buff.length}`,
    },

    data: dat,
  };

  await axios
    .request(config)
    .then((response) => {
      console.log(response.headers);
    })
    .catch((error) => {
      console.log(error);
    });
});
module.exports = upload;
