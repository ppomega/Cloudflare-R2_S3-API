const dotenv = require("dotenv");
dotenv.config();
const client = require("./src/index.js");
const c = new client({
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucket: process.env.CLOUDFLARE_BUCKET,
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  host: process.env.CLOUDFLARE_HOST,
});
async function test() {
  const r = await c.GetObject.getObject("");
  console.log(r);
}
test();
