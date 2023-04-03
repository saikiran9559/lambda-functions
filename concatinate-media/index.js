const {
  ChimeSDKMediaPipelines,
} = require("@aws-sdk/client-chime-sdk-media-pipelines");
const { Client } = require("pg");

const chimesdkmediapipelines = new ChimeSDKMediaPipelines({
  region: "us-east-1",
});
exports.handler = async (event) => {
  const client = new Client({
    host: process.env.HOST,
    port: process.env.PORT, // or whatever port your PostgreSQL database uses
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
  });
  try {
    if (
      event["detail-type"] == "Chime Media Pipeline State Change" &&
      event.detail.eventType == "chime:MediaPipelineInProgress"
    ) {
      const mediaCapturePipeline =
        await chimesdkmediapipelines.getMediaCapturePipeline({
          MediaPipelineId: event.detail.mediaPipelineId,
        });
      console.log(mediaCapturePipeline);
      const params = {
        Sinks: [
          {
            S3BucketSinkConfiguration: {
              Destination: `arn:aws:s3:::saikiran-chime-media-concatinated-bucket/${mediaCapturePipeline.MediaCapturePipeline.MediaPipelineId}`,
            },
            Type: "S3Bucket",
          },
        ],
        Sources: [
          {
            MediaCapturePipelineSourceConfiguration: {
              ChimeSdkMeetingConfiguration: {
                ArtifactsConfiguration: {
                  Audio: {
                    State: "Enabled",
                  },
                  Content: {
                    State: "Disabled",
                  },
                  CompositedVideo: {
                    State: "Disabled",
                  },
                  DataChannel: {
                    State: "Disabled",
                  },
                  TranscriptionMessages: {
                    State: "Disabled",
                  },
                  MeetingEvents: {
                    State: "Enabled",
                  },
                  Video: {
                    State: "Enabled",
                  },
                },
              },
              MediaPipelineArn:
                mediaCapturePipeline.MediaCapturePipeline.MediaPipelineArn,
            },
            Type: "MediaCapturePipeline",
          },
        ],
      };
      const data =
        await chimesdkmediapipelines.createMediaConcatenationPipeline(params);
      console.log(data);

      await client.connect();
      try {
        const query =
          "UPDATE media_pipelines SET status = $1 WHERE media_pipeline_id = $2";
        const values = ["InProgress", event.detail.mediaPipelineId];
        const result = await client.query(query, values);
        console.log(result);
      } catch (err) {
        console.log(err);
      } finally {
        await client.end();
      }
      return {
        statusCode: 200,
        body: {
          data: data,
        },
      };
    } else if (
      event["detail-type"] == "Chime Media Pipeline State Change" &&
      event.detail.eventType == "chime:MediaPipelineDeleted"
    ) {
      await client.connect();
      try {
        const query =
          "UPDATE media_pipelines SET status = $1 WHERE media_pipeline_id = $2";
        const values = ["Deleted", event.detail.mediaPipelineId];
        const result = await client.query(query, values);
        console.log(result);
      } catch (err) {
        console.log(err);
      } finally {
        await client.end();
      }
    } else if (
      event["detail-type"] == "Chime Media Pipeline State Change" &&
      event.detail.eventType == "chime:MediaPipelineTemporaryFailure"
    ) {
      await client.connect();
      try {
        const query =
          "UPDATE media_pipelines SET status = $1 WHERE media_pipeline_id = $2";
        const values = ["Temporary Failure", event.detail.mediaPipelineId];
        const result = await client.query(query, values);
        console.log(result);
      } catch (err) {
        console.log(err);
      } finally {
        await client.end();
      }
    } else if (
      event["detail-type"] == "Chime Media Pipeline State Change" &&
      event.detail.eventType == "chime:MediaPipelineResumed"
    ) {
      await client.connect();
      try {
        const query =
          "UPDATE media_pipelines SET status = $1 WHERE media_pipeline_id = $2";
        const values = ["Resumed", event.detail.mediaPipelineId];
        const result = await client.query(query, values);
        console.log(result);
      } catch (err) {
        console.log(err);
      } finally {
        await client.end();
      }
    } else if (
      event["detail-type"] == "Chime Media Pipeline State Change" &&
      event.detail.eventType == "chime:MediaPipelinePermanentFailure"
    ) {
      await client.connect();
      try {
        const query =
          "UPDATE media_pipelines SET status = $1 WHERE media_pipeline_id = $2";
        const values = ["Permanent Failure", event.detail.mediaPipelineId];
        const result = await client.query(query, values);
        console.log(result);
      } catch (err) {
        console.log(err);
      } finally {
        await client.end();
      }
    }
    return null;
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: { error: err },
    };
  }
};
