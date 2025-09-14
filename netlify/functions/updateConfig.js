const fs = require("fs");
const path = require("path");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);

    // config.json dosya yolu
    const configPath = path.join(process.cwd(), "config.json");

    fs.writeFileSync(configPath, JSON.stringify(body, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Config updated!" })
    };
  } catch (err) {
    return { statusCode: 500, body: "Error: " + err.message };
  }
};