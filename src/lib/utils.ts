import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  APP_BUTTON_TEXT,
  APP_DESCRIPTION,
  APP_ICON_URL,
  APP_NAME,
  APP_OG_IMAGE_URL,
  APP_PRIMARY_CATEGORY,
  APP_SPLASH_BACKGROUND_COLOR,
  APP_TAGS,
  APP_URL,
  APP_WEBHOOK_URL,
} from "./constants";
import { APP_SPLASH_URL } from "./constants";

interface MiniAppMetadata {
  version: string;
  name: string;
  iconUrl: string;
  homeUrl: string;
  imageUrl?: string;
  buttonTitle?: string;
  splashImageUrl?: string;
  splashBackgroundColor?: string;
  webhookUrl?: string;
  description?: string;
  primaryCategory?: string;
  tags?: string[];
  heroImageUrl?: string;
  tagline?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  castShareUrl?: string;
  screenshotUrl?: string;
}

interface MiniAppManifest {
  accountAssociation?: {
    header: string;
    payload: string;
    signature: string;
  };
  miniapp: MiniAppMetadata;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMiniAppEmbedMetadata(ogImageUrl?: string) {
  return {
    version: "next",
    imageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    button: {
      title: APP_BUTTON_TEXT,
      action: {
        type: "launch_frame",
        name: APP_NAME,
        url: APP_URL,
        splashImageUrl: APP_SPLASH_URL,
        iconUrl: APP_ICON_URL,
        splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
        description: APP_DESCRIPTION,
        primaryCategory: APP_PRIMARY_CATEGORY,
        tags: APP_TAGS,
      },
    },
  };
}

export async function getFarcasterMetadata(): Promise<MiniAppManifest> {
  // First check for MINI_APP_METADATA in .env and use that if it exists
  if (process.env.MINI_APP_METADATA) {
    try {
      const metadata = JSON.parse(process.env.MINI_APP_METADATA);
      return metadata;
    } catch (error) {
      console.warn(
        "Failed to parse MINI_APP_METADATA from environment:",
        error
      );
    }
  }

  if (!APP_URL) {
    throw new Error("NEXT_PUBLIC_URL not configured");
  }

  return {
    accountAssociation: {
      header:
        "eyJmaWQiOjIzODgxNCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDYyNjUyMkI1OGI5MmRBRjUzNTk2RjEzNzhiZDI1Qjc2NTNjMWZDNDkifQ",
      payload: "eyJkb21haW4iOiJmYXJ0cmVlLnZlcmNlbC5hcHAifQ",
      signature:
        "qVH9pN3diOj16ZpXAKOEoooXKncjoqQReC9QpC+13o9dzetesHdlSNUUGdhzDmbmjfPaoGZ0VDxrpftGXeum9xs=",
    },
    miniapp: {
      version: "1",
      name: APP_NAME ?? "Fartree",
      iconUrl: APP_ICON_URL,
      homeUrl: APP_URL,
      imageUrl: APP_OG_IMAGE_URL,
      buttonTitle: APP_BUTTON_TEXT ?? "🌳 Build Your Fartree",
      splashImageUrl: APP_SPLASH_URL,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      webhookUrl: APP_WEBHOOK_URL,
      description: APP_DESCRIPTION,
      primaryCategory: APP_PRIMARY_CATEGORY,
      tags: APP_TAGS,
      heroImageUrl: APP_SPLASH_URL,
      tagline: "The Linktree for Farcaster",
      ogTitle: `${APP_NAME} - The Linktree for Farcaster`,
      ogDescription: APP_DESCRIPTION,
      ogImageUrl: APP_OG_IMAGE_URL,
      castShareUrl: APP_URL,
      screenshotUrl: APP_SPLASH_URL,
    },
  };
}
