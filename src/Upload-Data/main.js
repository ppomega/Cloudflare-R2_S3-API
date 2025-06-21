class UploadData {
  constructor(bucket, accessKeyId, secretAccessKey, host, accountId) {
    this.bucket = bucket;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.host = host;
    this.accountId = accountId;
  }

  async smallUpload(filePath, key) {
    const s = require("./smallUpload");
    return await s(
      this.bucket,
      this.accessKeyId,
      this.secretAccessKey,
      this.host,
      this.accountId,
      filePath,
      key
    );
  }
  async largeUpload(filePath, key) {
    const l = require("./largeUp.js");
    return await l(
      filePath,
      key,
      this.bucket,
      this.accessKeyId,
      this.accountId,
      this.host,
      this.secretAccessKey
    );
  }
}
module.exports = UploadData;
