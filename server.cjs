require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const { server, PORT } = require("./dist-server/server/server.js");

const port = process.env.PORT || PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 [Trading-OS v2.0 Production Server] Live on http://localhost:${port}`);
});
