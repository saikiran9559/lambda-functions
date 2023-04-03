const {
  ChimeSDKMediaPipelines,
} = require("@aws-sdk/client-chime-sdk-media-pipelines");
const { Client } = require("pg");

const chimesdkmediapipelines = new ChimeSDKMediaPipelines({
  region: "us-east-1",
});

const params = (attendees, media_pipeline_id) => {
  const n = attendees.length;
  const values = [];
  const query =
    "INSERT INTO recorded_data (media_pipeline_id, attendee_id) VALUES ";
  let a = "";
  let k = 1;
  for (let i = 0; i < n; i++) {
    let st = `($${k}, $${k + 1})`;
    if (i != n - 1) {
      st = st + ", ";
    }
    k = k + 2;
    a = a + st;
    values.push(media_pipeline_id, attendees[i]);
  }
  return {
    query: query + a,
    values: values,
  };
};
exports.handler = async (event) => {
  const client = new Client({
    host: process.env.HOST,
    port: process.env.PORT, // or whatever port your PostgreSQL database uses
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
  });
  if (!event?.body?.meetingId  || !event?.body?.attendee_ids?.length == 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "meeting_id , attendee_ids (atleast one attendee id) are required parameters",
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
  }
  try {
    let captureParams = {
      SinkArn: "arn:aws:s3:::saikiran-chime-media-bucket",
      SinkType: "S3Bucket",
      SourceArn: `arn:aws:chime:us-east-1:098055497445:meeting/${event?.body?.meeting_id}`,
      SourceType: "ChimeSdkMeeting",
      ChimeSdkMeetingConfiguration: {
        ArtifactsConfiguration: {
          Audio: {
            MuxType: "AudioWithCompositedVideo",
          },
          Content: {
            State: "Disabled",
          },
          Video: {
            State: "Enabled",
            MuxType: "VideoOnly",
          },
          SourceConfiguration: {
            SelectedVideoStreams: {
              AttendeeIds: event.body.attendee_ids,
            },
          },
        },
      },
    };

    const data = await chimesdkmediapipelines.createMediaCapturePipeline(
      captureParams
    );
    console.log(data);

    await client.connect();
    try {
      const query =
        "INSERT INTO media_pipelines (media_pipeline_id, meeting_id, host_id, status) VALUES ($1, $2, $3, $4)";
      const values = [
        data?.MediaCapturePipeline?.MediaPipelineId,
        event?.body?.meetingId,
        "saikiran123",
        data?.MediaCapturePipeline?.Status,
      ];

      console.log(values);
      const result1 = await client.query(query, values);
      console.log(result1);
      const attendees = event?.body?.attendee_ids;
      const inputs = params(
        attendees,
        data?.MediaCapturePipeline?.MediaPipelineId
      );
      console.log(inputs);
      const result2 = await client.query(inputs.query, inputs.values);
      console.log(result2);
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
