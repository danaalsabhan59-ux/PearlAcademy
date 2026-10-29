import { CalculateMetadataFunction, Composition } from "remotion";
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
  );
};
