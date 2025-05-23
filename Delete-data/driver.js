const { XMLParser } = require("fast-xml-parser");
const Delete = require("./delete");
const parser = new XMLParser();
const Getl = require("./getl");
var upids;
async function n() {
  var obj = await Getl();
  obj = parser.parse(obj);
  upids = obj.ListMultipartUploadsResult.Upload;
  console.log(upids.UploadId);
  await Delete("g.mp4", upids.UploadId);
  for (let i = 0; i < upids.length; i++) {
    await Delete("g.mp4", upids[i].UploadId);
  }
}
n();
