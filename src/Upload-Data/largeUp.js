const uploadRequest = require("./uploadReq");
const uploadPart = require("./uploadPart");
const { XMLBuilder, XMLParser } = require("fast-xml-parser");

const completeUpload = require("./completeUpload");
const fs = require("node:fs");
const path = require("node:path");
async function largeFileUpload(
  filePath,
  key,
  bucket,
  accessKeyId,
  accountId,
  host,
  secretAccessKey
) {
  const r1 = await uploadRequest(
    bucket,
    accessKeyId,
    secretAccessKey,
    host,
    accountId,
    key
  );
  const parser = new XMLParser();
  const uploadId = parser.parse(r1).InitiateMultipartUploadResult.UploadId;
  console.log(uploadId);
  var partnumber = 0;
  const fileSize = fs.statSync(filePath).size;
  const parts = [];
  var start = 0;
  var end = 1000000000;
  while (end < fileSize) {
    await uploadPart(
      bucket,
      accessKeyId,
      secretAccessKey,
      host,
      accountId,
      filePath,
      uploadId,
      partnumber + 1,
      key,
      start,
      end
    ).then((res) => {
      parts.push(res.headers.etag);
      start = end + 1;
    });
    if (end == fileSize - 1) {
      break;
    }
    end += 1000000001;
    end = Math.min(end, fileSize - 1);
    partnumber++;
  }
  var body = {
    CompleteMultipartUpload: { Part: [] },
  };
  for (let i = 0; i < parts.length; i++) {
    var ib = { PartNumber: i + 1, ETag: parts[i] };
    body.CompleteMultipartUpload.Part.push(ib);
  }

  const builder = new XMLBuilder({ ignoreAttributes: false });
  const xml = builder.build(body);
  const r3 = await completeUpload(
    bucket,
    accessKeyId,
    secretAccessKey,
    host,
    accountId,
    uploadId,
    key,
    xml
  );
  return r3;
}
module.exports = largeFileUpload;
