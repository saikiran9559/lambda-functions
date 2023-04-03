const { ChimeSDKMeetings } = require("@aws-sdk/client-chime-sdk-meetings");
const { Client } = require("pg");

const getValue = (value) => {
  return value < 10 ? `0${value}` : value;
};
const getDateTime = () => {
  const date = new Date();
  return {
    date: `${date.getFullYear()}-${getValue(date.getMonth() + 1)}-${getValue(
      date.getDate()
    )}`,
    time: `${getValue(date.getHours())}:${getValue(
      date.getMinutes()
    )}:${getValue(date.getSeconds())}+05:30`,
  };
};
exports.handler = async (event) => {
  // TODO implement
  const client = new Client({
    host: process.env.HOST,
    port: process.env.PORT, // or whatever port your PostgreSQL database uses
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
  });
  try {
    const chime = new ChimeSDKMeetings({ region: "us-east-1" });
    const meetingId = event["queryStringParameters"]["meetingId"];
    const username = event.requestContext.authorizer.claims["cognito:username"];
    const meet_response = await chime.getMeeting({ MeetingId: meetingId });
    console.log(meet_response);
    if (meet_response?.Meeting?.MeetingHostId != username) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "only meeting host can delete the meeting",
        }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Headers":
            "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
          "Access-Control-Allow-Methods": "OPTIONS,POST,DELETE",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Origin": "*",
          "X-Requested-With": "*",
        },
      };
    }
    const data = await chime.deleteMeeting({ MeetingId: meetingId });
    await client.connect();
    try {
      const time_change_query =
        "UPDATE meetings SET ended_time = $1 , ended_date=$2, status=$3 WHERE meetingId = $4";
      const result = await client.query(time_change_query, [
        getDateTime().time,
        getDateTime().date,
        "Ended",
        meetingId,
      ]);
      console.log(result);
    } catch (err) {
      console.log(err);
    } finally {
      await client.end();
    }
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,POST,DELETE",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "X-Requested-With": "*",
      },
      body: JSON.stringify({
        data: data,
        message: "successfully deleted meeting",
      }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: err?.$metadata?.httpStatusCode,
      body: JSON.stringify({ message: err?.message, name: err?.name }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "X-Requested-With": "*",
      },
    };
  }
};
