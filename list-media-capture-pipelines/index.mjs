import { ChimeSDKMediaPipelines } from "@aws-sdk/client-chime-sdk-media-pipelines";

const chimesdkmediapipelines = new ChimeSDKMediaPipelines({
  region: "us-east-1",
});
export const handler = async (event) => {
  try {
    const data = await chimesdkmediapipelines.listMediaCapturePipelines({
      MaxResults: event.MaxResults,
    });
    const data2 = await chimesdkmediapipelines.listMediaPipelines({
      MaxResults: event.MaxResults,
    });
    return {
      statusCode: 200,
      body: {
        media_capture_pipelines: data.MediaCapturePipelines,
        media_pipelines: data2.MediaPipelines,
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: { error: err },
    };
  }
};
