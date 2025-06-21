const deleteo = require("./delete.js");
class DeleteObject {
  constructor(bucket, accessKeyId, secretAccessKey, host, accountId) {
    this.bucket = bucket;

    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.host = host;
    this.accountId = accountId;
  }
  async deleteObject(filename) {
    return await deleteo(
      this.bucket,
      this.accessKeyId,
      this.secretAccessKey,
      this.host,
      this.accountId,
      filename
    );
  }
}
module.exports = DeleteObject;
