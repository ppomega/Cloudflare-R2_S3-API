const crypto = require("crypto-js");

// // Replace with your actual values
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESSKEY;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRETKEY;
const region = "auto"; // Cloudflare R2 uses S3-compatible APIs, so `us-east-1` is generally fine.
const service = "s3"; // If you're targeting a specific bucket
const host = process.env.CLOUDFLARE_R2_HOST; // Replace with your Cloudflare account ID
const method = "DELETE"; // Modify this based on your query parameters

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
async function Delete(filename, uploadid) {
  // // Step 2: Create the Canonical Request
  const canonicalUri = `/thunder-streams/${filename}`;
  const q = `uploadId=${uploadid}`;
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const payloadHash = "UNSIGNED-PAYLOAD";
  const canonicalRequest = `${method}\n${canonicalUri}\n${q}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  console.log(canonicalRequest);
  // // Step 3: Create the String to Sign
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto
    .SHA256(canonicalRequest)
    .toString(crypto.enc.Hex)}`;
  // // Step 4: Calculate the Signature
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

  // // Step 5: Add the Authorization Header
  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const axios = require("axios");

  let config = {
    method: "delete",
    maxBodyLength: Infinity,
    url: `${process.env.CLOUDFLARE_R2_ACCOUNT_ID}/thunder-streams/${filename}?uploadId=${uploadid}`,
    headers: {
      Authorization: authorizationHeader,
      "x-amz-date": amzDate,
      Host: host,
      "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
      "Content-Type": "application/json",
    },
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
}
// Delete(
//   "prateek.rar",
//   "APbOIYINsFi4wp__nCULqMVxxAFyC1lLzIQMjlhvNZ7Wo-KijznNmFBAv_PXps07lNv3SL8UsWvP6jK0LFByv5NiVdyJa5t2lxMOn7JUSLkC-xnguMolTtAHB0QKp5sP8NV4qxhgBiZiJ6CR-5P6GJOnYAeS1Eid_leAYvZ0ztCVqmcSMklm_oBIs-8V6yGWAPt5QpcnH_5oB08o7dg8DOZWEdhW6reubxgfLY0zIANTKnaEf4bejfZsDmiEvXAltLLDLrLdUifekORykh6Uc_jfplSxtGzV1qvG3dQxlWuFvohe81aqNcxILap3e2YOx5dnMgV6ZHmv69vRPCW44gQ"
// );
module.exports = Delete;
