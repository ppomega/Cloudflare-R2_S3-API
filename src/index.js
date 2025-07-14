const GetObject = require("./Get-Data/main.js");
const UploadData = require("./Upload-Data/main.js");
const DeleteObject = require("./Delete-data/main.js");
class CloudflareR2 {
  constructor({ accessKeyId, secretAccessKey, bucket, accountId, host }) {
    this.bucket = bucket;
    this.accountId = accountId;
    this.host = host;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.GetObject = new GetObject(
      this.bucket,
      this.accessKeyId,
      this.secretAccessKey,
      this.host,
      this.accountId
    );
    this.UploadData = new UploadData(
      this.bucket,
      this.accessKeyId,
      this.secretAccessKey,
      this.host,
      this.accountId
    );
    this.DeleteObject = new DeleteObject(
      this.bucket,
      this.accessKeyId,
      this.secretAccessKey,
      this.host,
      this.accountId
    );
  }
}
module.exports = CloudflareR2;
