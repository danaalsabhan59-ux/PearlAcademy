import { CalculateMetadataFunction, Composition } from "remotion";
import { BasiraAI } from "./basira/BasiraAI";
import * as BasiraTimeline from "./basira/data/timeline";
import { StrokeCode } from "./strokecode/compositions/StrokeCode";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./strokecode/data/timeline";
import { StrokeVideo, StrokeVideoProps } from "./StrokeVideo";
import { dialogue, timeline } from "./timeline";

const calculateMetadata: CalculateMetadataFunction<StrokeVideoProps> = ({
  isRendering,
  props,
}) => {
  // Never export a video with missing (silent) dialogue. `visualCheck` renders
  // have no audio at all and carry a watermark, so they can't pass as final.
  if (isRendering && !props.visualCheck && timeline.missingVoices.length > 0) {
    throw new Error(
      `Voices missing for: ${timeline.missingVoices.join(", ")}. Run "npm run voices" first.`,
    );
  }
  return {
    durationInFrames: Math.ceil(timeline.duration * dialogue.fps),
    defaultOutName: "stroke-awareness",
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BasiraAI"
        component={BasiraAI}
        durationInFrames={BasiraTimeline.TOTAL_FRAMES}
        fps={BasiraTimeline.FPS}
        width={BasiraTimeline.WIDTH}
        height={BasiraTimeline.HEIGHT}
        defaultProps={{ muted: false }}
      />
      <Composition
        id="StrokeCode"
        component={StrokeCode}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ showSafeZones: false, muted: false }}
      />
      <Composition
        id="StrokeAwareness"
        component={StrokeVideo}
        durationInFrames={Math.ceil(timeline.duration * dialogue.fps)}
        fps={dialogue.fps}
        width={1920}
        height={1080}
        defaultProps={{ visualCheck: false }}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
