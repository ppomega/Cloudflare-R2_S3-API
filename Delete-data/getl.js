const crypto = require("crypto-js");

// // Replace with your actual values
const accessKeyId = "098dc721de4cf12306ea3e552220b12b";
const secretAccessKey =
  "d961af5a27c2918c5b6bad8bb1d09c0f522a8e66d37a20b4c3683f0f19a04c95";
const region = "auto"; // Cloudflare R2 uses S3-compatible APIs, so `us-east-1` is generally fine.
const service = "s3"; // If you're targeting a specific bucket
const host = "86e8cb467112239bc31c8bc63ec40a0d.r2.cloudflarestorage.com"; // Replace with your Cloudflare account ID
const method = "GET"; // Modify this based on your query parameters

// // Prepare the request payload (for GET requests it's an empty string)

// // Step 1: Create the date for headers and signature
const currentDate = new Date();

const amzDate =
  currentDate
    .toISOString()
    .replace(/[:-]|\.\d{3}/g, "")
    .substr(0, 15) + "Z";
//  // YYYYMMDD'T'HHMMSS'Z'
const dateStamp = amzDate.substr(0, 8); // YYYYMMDD

// // Step 2: Create the Canonical Request
const canonicalUri = "/thunder-streams";
const q = "uploads=";
const canonicalHeaders = `host:${host}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;
const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
const payloadHash = "UNSIGNED-PAYLOAD";
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

const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, service);
const signature = crypto
  .HmacSHA256(stringToSign, signingKey)
  .toString(crypto.enc.Hex);

const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

const axios = require("axios");
const FormData = require("form-data");
let data = new FormData();

let config = {
  method: "get",
  maxBodyLength: Infinity,
  url: `${process.env.CLOUDFLARE_R2_ACCOUNT_ID}/thunder-streams?uploads`,
  headers: {
    Authorization: authorizationHeader,
    "x-amz-date": amzDate,
    Host: host,
    "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
    "Content-Type": "application/json",
  },
};
async function Getl() {
  var res = await axios.request(config);

  return res.data;
}

module.exports = Getl;
