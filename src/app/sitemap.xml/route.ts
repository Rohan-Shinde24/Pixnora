import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import ImageModel from "@/models/Image";

const staticPaths = ["/", "/about", "/how-it-works"];
const xmlEscape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const urls: { loc: string; lastmod?: string }[] = staticPaths.map((path) => ({
    loc: new URL(path, origin).toString(),
  }));

  const db = await connectDB();
  if (db) {
    try {
      const images = await ImageModel.find({})
        .select("_id updatedAt")
        .sort({ updatedAt: -1 })
        .limit(49_990)
        .lean()
        .exec();

      for (const image of images) {
        urls.push({
          loc: new URL(`/image/${image._id.toString()}`, origin).toString(),
          lastmod: image.updatedAt instanceof Date ? image.updatedAt.toISOString() : undefined,
        });
      }
    } catch (error) {
      console.error("[SEO] Failed to load image URLs for sitemap:", error);
    }
  }

  const entries = urls.map(({ loc, ...fields }) => {
    const lastmod = "lastmod" in fields && fields.lastmod
      ? `<lastmod>${xmlEscape(fields.lastmod)}</lastmod>`
      : "";
    return `<url><loc>${xmlEscape(loc)}</loc>${lastmod}</url>`;
  });
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
