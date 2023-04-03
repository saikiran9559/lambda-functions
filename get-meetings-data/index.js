const { Client } = require("pg");

exports.handler = async (event) => {
  console.log(event)
  const client = new Client({
    host: process.env.HOST,
    port: process.env.PORT, // or whatever port your PostgreSQL database uses
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
  });

  await client.connect();
  try {
    const username =
      event?.requestContext?.authorizer?.claims["cognito:username"];

    const from_date = event?.body?.from_date;
    const to_date = event?.body?.to_date;
    let query = "select * from meetings where username = $1";
    let values = [username];
    if (from_date && to_date) {
      query =
        "select * from meetings where username = $1 and created_date >= $2 and created_date <= $3";
      values = [username, from_date, to_date];
    }
    const result = await client.query(query, values);
    console.log(result);
    const response = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "X-Requested-With": "*",
      },
      body: JSON.stringify({
        data: result?.rows,
      }),
    };
    return response;
  } catch (err) {
    console.log(err);
    if (err?.routine == "DateTimeParseError") {
      const response = {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Headers":
            "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
          "Access-Control-Allow-Methods": "OPTIONS,POST",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Origin": "*",
          "X-Requested-With": "*",
        },
        body: JSON.stringify({
          error: {
            message: "invalid date format : hint `2023-03-24`",
            name: err?.routine,
          },
        }),
      };
      return response;
    } else {
      const response = {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Headers":
            "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
          "Access-Control-Allow-Methods": "OPTIONS,POST",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Origin": "*",
          "X-Requested-With": "*",
        },
        body: JSON.stringify({
          error: {
            message: "internal server error",
          },
        }),
      };
      return response;
    }
  } finally {
    await client.end();
    console.log("disconnected")
  }
};
