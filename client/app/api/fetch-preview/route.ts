import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
      },
    });

    const html = response.data;

    const isYouTubeVideo = url.includes("youtube.com") || url.includes("youtu.be");
    if (isYouTubeVideo) {
      const videoIdMatch = url.match(/(?:\/embed\/|\/watch\?v=|youtu\.be\/)([^&?#]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (videoId) {
        const videoThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        // Extract title and description from YouTube HTML
        const titleMatch = html.match(/<meta name="title" content="(.*?)"/);
        const title = titleMatch ? titleMatch[1] : "";

        const descriptionMatch = html.match(/<meta name="description" content="(.*?)"/);
        const description = descriptionMatch ? descriptionMatch[1] : "";

        return NextResponse.json({
          videoId,
          videoThumbnail,
          title,
          description,
        });
      }
    }

    // Parse metadata for non-YouTube URLs
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : "";

    const descriptionMatch = html.match(/<meta name="description" content="(.*?)"/);
    const description = descriptionMatch ? descriptionMatch[1] : "";

    const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/);
    const image = imageMatch ? imageMatch[1] : "";

    return NextResponse.json({ title, description, image });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch link preview." }, { status: 500 });
  }
}
