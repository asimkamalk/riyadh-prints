export type GalleryItem = {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataUrl?: string | null;
};

export function mediaToGalleryItem(media: {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
}): GalleryItem {
  return {
    src: media.url,
    alt: media.alt,
    width: media.width && media.width > 0 ? media.width : 1200,
    height: media.height && media.height > 0 ? media.height : 900,
    blurDataUrl: media.blurDataUrl,
  };
}
