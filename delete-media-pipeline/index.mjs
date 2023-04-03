import { ChimeSDKMediaPipelines } from "@aws-sdk/client-chime-sdk-media-pipelines";

const chimesdkmediapipelines = new ChimeSDKMediaPipelines({
  region: "us-east-1",
});
export const handler = async (event) => {
  try {
    const data = await chimesdkmediapipelines.deleteMediaCapturePipeline({
      MediaPipelineId: event.mediaPipelineId,
    });
    return {
      statusCode: 200,
      body: {
        message: "successfully deleted media capture pipelines",
        data: data,
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: {
        error: err,
      },
    };
  }
};
