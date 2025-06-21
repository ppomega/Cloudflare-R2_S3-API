const getobj = require("./getobj.js");
const getChunk = require("./get.js");
const listObject = require("./listobj.js");
class GetObject {
  constructor(bucket, accessKeyId, secretAccessKey, host, accountId) {
    this.bucket = bucket;

    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.host = host;
    this.accountId = accountId;
  }
  async getObject(path) {
    return await getobj(
      this.bucket,
      path,
      this.accessKeyId,
      this.secretAccessKey,
      this.host,
      this.accountId
    );
  }
  async getChunk(path, start, end) {
    return await getChunk(
      this.bucket,
      path,
      this.accessKeyId,
      this.secretAccessKey,
      this.host,
      this.accountId,
      start,
      end
    );
  }
  async listObject(prefix) {
    return await listObject(
      this.bucket,
      this.accessKeyId,

      this.secretAccessKey,
      this.host,

      this.accountId,
      prefix
    );
  }
}

module.exports = GetObject;
