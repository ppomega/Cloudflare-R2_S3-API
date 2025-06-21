const dotenv = require("dotenv");
const UploadData = require("./src/Upload-Data/main.js");
dotenv.config();

const a = new UploadData(
  "thunder-streams",
  process.env.CLOUDFLARE_R2_ACCESSKEY,
  process.env.CLOUDFLARE_R2_SECRETKEY,
  process.env.CLOUDFLARE_R2_HOST,
  process.env.CLOUDFLARE_R2_ACCOUNT_ID
);
a.largeUpload("D:/Games/fg-01.bin", "a.bin")
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.error(err);
  });
