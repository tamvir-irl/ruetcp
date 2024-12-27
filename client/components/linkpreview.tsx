import { useState, useEffect } from "react";
import { Image } from "@nextui-org/react";

interface LinkPreviewProps {
  url: string;
}

const decodeHTMLEntities = (text: string): string => {
  const parser = new DOMParser();
  const decoded = parser.parseFromString(text, "text/html").documentElement.textContent;
  return decoded || text;
};

const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
  const [previewData, setPreviewData] = useState<{
    title?: string;
    description?: string;
    image?: string;
    videoId?: string;
    videoThumbnail?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await fetch(`/api/fetch-preview?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        // Decode HTML entities in title and description
        if (data.title) {
          data.title = decodeHTMLEntities(data.title);
        }
        if (data.description) {
          data.description = decodeHTMLEntities(data.description);
        }

        setPreviewData(data);
      } catch (error) {
        console.error("Error fetching link preview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  const handleClick = () => {
    window.open(url, "_blank");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!previewData) {
    return <p>Failed to fetch link preview.</p>;
  }

  if (previewData.videoId) {
    return (
      <div className="w-full flex items-center" onClick={handleClick} style={{ cursor: "pointer" }}>
        <Image
          src={previewData.videoThumbnail as string}
          alt="Video Thumbnail"
          width={320}
          height={180}
          style={{ maxWidth: "100%", height: "auto" }}
        />
        <div className="ml-4">
          <h3 className="text-2xl font-bold">{previewData.title}</h3>
          <p>{previewData.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center" onClick={handleClick} style={{ cursor: "pointer" }}>
      {previewData.image && (
        <Image
          src={previewData.image}
          alt="Link Preview"
          width={320}
          height={180}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      )}
      <div className="ml-4 w-full">
        <h3 className="text-2xl font-bold w-full">{previewData.title}</h3>
        <br />
        <p>{previewData.description}</p>
      </div>
    </div>
  );
};

export default LinkPreview;
