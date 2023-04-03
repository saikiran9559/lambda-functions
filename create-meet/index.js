const { ChimeSDKMeetings } = require("@aws-sdk/client-chime-sdk-meetings");
const { Client } = require("pg");

const generateToken = (username) => {
  const date = new Date();
  return `${date.getTime()}${username}`;
};
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
    const user = event.requestContext.authorizer.claims;
    console.log(user);
    const createMeetingResponse = await chime.createMeeting({
      ClientRequestToken: generateToken(user["cognito:username"]),
      MediaRegion: "us-east-1",
      MeetingHostId: user["cognito:username"],
      ExternalMeetingId: event.body?.meeting_name
        ? event.body?.meeting_name
        : `${user["cognito:username"]}_meet`,
    });
    console.log(createMeetingResponse);
    const meetingId = createMeetingResponse.Meeting.MeetingId;
    const addAttendeeResponse = await chime.createAttendee({
      MeetingId: meetingId,
      ExternalUserId: user["cognito:username"],
    });
    console.log(addAttendeeResponse);
    console.log(getDateTime());
    await client.connect();
    try {
      const query = `INSERT INTO meetings (meetingId, username, meeting_name, status, created_time, created_date) VALUES ($1, $2, $3, $4, $5, $6)`;
      const values = [
        createMeetingResponse.Meeting.MeetingId,
        user["cognito:username"],
        createMeetingResponse.Meeting.ExternalMeetingId,
        "In_Progress",
        getDateTime().time,
        getDateTime().date,
      ];
      const result = await client.query(query, values);
      console.log(result);
    } catch (err) {
      console.log(err);
    } finally {
      await client.end();
      console.log("disconnected");
    }

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
        meetingResponse: createMeetingResponse.Meeting,
        attendeeResponse: addAttendeeResponse.Attendee,
      }),
    };
    return response;
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
