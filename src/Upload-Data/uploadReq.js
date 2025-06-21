const axios = require("axios");
const crypto = require("crypto-js");
async function uploadReq(
  bucket,
  accessKeyId,
  secretAccessKey,
  host,
  accountId,
  key
) {
  const region = "auto";
  const service = "s3";
  const method = "POST";

  const currentDate = new Date();

  const amzDate =
    currentDate
      .toISOString()
      .replace(/[:-]|\.\d{3}/g, "")
      .substr(0, 15) + "Z";
  const dateStamp = amzDate.substr(0, 8);
  const canonicalUri = `/${bucket}/${key}`;
  const canonicalQueryString = "uploads=";
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const payloadHash = "UNSIGNED-PAYLOAD";
  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
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

  let config = {
    method: "post",
    url: `${accountId}/${bucket}/${key}?uploads`,
    headers: {
      Authorization: authorizationHeader,
      "x-amz-date": amzDate,
      Host: host,
      "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
      "Content-Type": "application/octet-stream",
    },
  };

  var res = await axios.request(config);

  return res.data;
}
module.exports = uploadReq;
