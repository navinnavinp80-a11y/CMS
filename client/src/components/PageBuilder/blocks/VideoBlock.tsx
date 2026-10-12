import { Video } from "lucide-react";
import type { PageComponent } from "../types";

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }

  return null;
};

interface VideoBlockProps {
  component: PageComponent;
}

export function VideoBlock({ component }: VideoBlockProps) {
  const embedUrl = component.videoUrl ? getYouTubeEmbedUrl(component.videoUrl) : null;

  return (
    <section className="preview-video">
      {!component.videoUrl ? (
        <div className="video-placeholder">
          <Video size={36} />
          <h3>Video Preview</h3>
          <p>Add a video URL from the editor</p>
        </div>
      ) : embedUrl ? (
        <iframe
          src={embedUrl}
          title="YouTube Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          src={component.videoUrl}
          controls
          playsInline
        />
      )}
    </section>
  );
}
