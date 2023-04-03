const { Client } = require("pg");
exports.handler = async (event) => {
  // TODO implement
  console.log(event);
  if (event.triggerSource == "PostConfirmation_ConfirmSignUp") {
    const client = new Client({
      host: process.env.HOST,
      port: process.env.PORT, // or whatever port your PostgreSQL database uses
      database: process.env.DATABASE,
      user: process.env.USER,
      password: process.env.PASSWORD,
    });
    await client.connect();
    try {
      const query = `INSERT INTO users (username, email) VALUES ($1, $2)`;
      const values = [event.userName, event.request.userAttributes.email];
      const result = await client.query(query, values);
      console.log(result);
    } catch (err) {
      console.log(err);
    } finally {
      await client.end();
    }
  }
  return event;
};
