import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH ?? (repoName ? `/${repoName}` : "");
const appBasePath = basePath && basePath !== "/" ? basePath : "";
const appRoot = appBasePath ? `${appBasePath}/` : "/";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: appRoot,
    name: "oh-my-ag Official Docs",
    short_name: "oh-my-ag docs",
    description: "Official documentation site for oh-my-ag.",
    start_url: appRoot,
    scope: appRoot,
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#b23a34",
    icons: [
      {
        src: `${appBasePath}/icons/android/android-launchericon-48-48.png`,
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: `${appBasePath}/icons/android/android-launchericon-72-72.png`,
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: `${appBasePath}/icons/android/android-launchericon-96-96.png`,
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: `${appBasePath}/icons/android/android-launchericon-144-144.png`,
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: `${appBasePath}/icons/android/android-launchericon-192-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${appBasePath}/icons/android/android-launchericon-512-512.png`,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: `${appBasePath}/icons/ios/180.png`,
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: `${appBasePath}/icons/ios/1024.png`,
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
