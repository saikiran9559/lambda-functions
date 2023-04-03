import { ChimeSDKMediaPipelines } from "@aws-sdk/client-chime-sdk-media-pipelines";

const chimesdkmediapipelines = new ChimeSDKMediaPipelines({
  region: "us-east-1",
});
export const handler = async (event) => {
  try {
    const data2 = await chimesdkmediapipelines.getMediaPipeline({
      MediaPipelineId: event.mediaPipelineId,
    });
    console.log(data2)
    const data = await chimesdkmediapipelines.getMediaCapturePipeline({
      MediaPipelineId: event.mediaPipelineId,
    });
    console.log(data)
    return {
      statusCode: 200,
      body: {
        media_capture_pipeline: data,
        media_pipeline: data2,
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
