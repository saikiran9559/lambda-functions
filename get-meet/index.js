const { ChimeSDKMeetings } = require("@aws-sdk/client-chime-sdk-meetings");
exports.handler = async (event) => {
  // TODO implement
  try {
    const chime = new ChimeSDKMeetings({ region: "us-east-1" });
    const user = event.requestContext.authorizer.claims;
    const meetingId = event["queryStringParameters"]["meetingId"];
    const meetingResponse = await chime.getMeeting({ MeetingId: meetingId });

    console.log("18", meetingResponse);

    const addAttendeeResponse = await chime.createAttendee({
      MeetingId: meetingId,
      ExternalUserId: user["cognito:username"],
    });
    console.log("24", addAttendeeResponse);
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        meetingResponse: meetingResponse.Meeting,
        attendeeResponse: addAttendeeResponse.Attendee,
      }),
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
    return response;
  } catch (err) {
    console.log("43", JSON.stringify({error:err}));
    console.log("44", err?.code, err?.$metadata, err?.message);
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
