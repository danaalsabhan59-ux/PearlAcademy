import { CalculateMetadataFunction, Composition, Still } from "remotion";
import { BasiraAI } from "./basira/BasiraAI";
import { BasiraMobile } from "./basira/mobile/BasiraMobile";
import { PosterPrompts, PosterTools } from "./basira/poster/Poster";
import * as BasiraTimeline from "./basira/data/timeline";
import { NuclearAwareness } from "./nuclear/NuclearAwareness";
import * as NuclearTimeline from "./nuclear/data/timeline";
import { NuclearPart, PartOverlay, PARTS } from "./nuclear/social/Parts";
import { CarouselSlide, NuclearCover } from "./nuclear/social/Carousel";
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
      {PARTS.map((p, i) => (
        <Composition key={i} id={`NuclearPart${i + 1}`} component={NuclearPart} durationInFrames={p.to - p.from} fps={30} width={1080} height={1920} defaultProps={{ part: i }} />
      ))}
      {[0, 1, 2, 3, 4, 5].map((n) => (
        <Still key={n} id={`NuclearCarousel${n + 1}`} component={CarouselSlide} width={1080} height={1350} defaultProps={{ n }} />
      ))}
      <Still id="NuclearPartOverlay" component={PartOverlay} width={1080} height={1920} defaultProps={{ part: 0, mode: "badge" as "badge" | "next" }} />
      <Still id="NuclearCover" component={NuclearCover} width={1080} height={1920} />
      <Composition
        id="NuclearAwareness"
        component={NuclearAwareness}
        durationInFrames={NuclearTimeline.TOTAL}
        fps={NuclearTimeline.FPS}
        width={NuclearTimeline.W}
        height={NuclearTimeline.H}
        defaultProps={{ muted: false, headerStyle: "transparent" as const }}
      />
      <Still id="BasiraPosterTools" component={PosterTools} width={1080} height={1920} />
      <Still id="BasiraPosterPrompts" component={PosterPrompts} width={1080} height={1920} />
      <Composition
        id="BasiraMobile"
        component={BasiraMobile}
        durationInFrames={BasiraTimeline.TOTAL_FRAMES}
        fps={BasiraTimeline.FPS}
        width={1080}
        height={1920}
        defaultProps={{ showSafeZones: false }}
      />
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
