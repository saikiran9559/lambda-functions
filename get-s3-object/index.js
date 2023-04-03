const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const client = new S3Client({});
exports.handler = async (event) => {
  const command = new GetObjectCommand({
    Bucket: event.bucket,
    Key: event.key,
  });
  try {
    const response = await client.send(command);
    // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
    // const str = await response.Body.transformToString();
    console.log(response);
  } catch (err) {
    console.error(err);
  }
};
