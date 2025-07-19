const axios = require("axios");
const crypto = require("crypto-js");
const crypt = require("crypto");

const fs = require("node:fs");
const { pipeline } = require("node:stream/promises");
async function upload(
  bucket,
  accessKeyId,
  secretAccessKey,
  host,
  accountId,
  filePath,
  uploadId,
  partNumber,
  key,
  start,
  end
) {
  let data = fs.createReadStream(filePath, {
    start: start,
    end: end,
  });

  const region = "auto";
  const service = "s3";
  const method = "PUT";
  let da = [];
  var payloadHash = "";
  await pipeline(data, async (source) => {
    for await (const chunk of source) {
      da.push(chunk);
    }
  });

  const buff = Buffer.concat(da);
  const hash = crypt.createHash("sha256").update(buff).digest("hex");

  payloadHash = hash;
  const currentDate = new Date();

  const amzDate =
    currentDate
      .toISOString()
      .replace(/[:-]|\.\d{3}/g, "")
      .substr(0, 15) + "Z";
  const dateStamp = amzDate.substr(0, 8);

  const canonicalUri = `/${bucket}/${encodeURI(key)}`;
  const q = `partNumber=${partNumber}&uploadId=${uploadId}`;
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
  let dat = fs.createReadStream(filePath, {
    start: start,
    end: end,
  });
  let config = {
    method: "PUT",
    url: `https://${host}/${bucket}/${key}?partNumber=${partNumber}&uploadId=${uploadId}`,
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

  var res = await axios
    .request(config)
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
  return res;
}
module.exports = upload;
