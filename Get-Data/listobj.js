const axios = require("axios");
const crypto = require("crypto-js");
const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser();
async function List(prefix) {
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESSKEY;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRETKEY;
  const region = "auto";
  const service = "s3";
  const host = process.env.CLOUDFLARE_R2_HOST; // Replace with your Cloudflare account ID
  const method = "GET";
  const currentDate = new Date();

  const amzDate =
    currentDate
      .toISOString()
      .replace(/[:-]|\.\d{3}/g, "")
      .substr(0, 15) + "Z";
  const dateStamp = amzDate.substr(0, 8);

  const canonicalUri = `/thunder-streams/\nprefix=${prefix}`;
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalHeaders}\n${signedHeaders}\nUNSIGNED-PAYLOAD`;
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
    method: "GET",
    url: `${process.env.CLOUDFLARE_R2_ACCOUNT_ID}/thunder-streams/?prefix=${prefix}`,
    headers: {
      Authorization: authorizationHeader,
      Host: host,
      "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
      "x-amz-date": amzDate,
    },
  };
  try {
    res = await axios.request(config);
    let jObj = parser.parse(res.data);

    return jObj.ListBucketResult;
  } catch (e) {
    console.log(e);
    console.log(canonicalRequest);

    return 0;
  }
}
module.exports = List;
