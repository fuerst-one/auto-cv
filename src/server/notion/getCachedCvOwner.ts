import { unstable_cache } from "next/cache";
import { getCvOwner, toPublicOwner } from "./getCvOwner";

export const CV_OWNER_CACHE_TAG = "cv-owner";

export const getCachedCvOwner = unstable_cache(
  () => getCvOwner(),
  ["cv-owner-v4"],
  { tags: [CV_OWNER_CACHE_TAG], revalidate: false },
);

export const getCachedCvOwnerPublic = async () =>
  toPublicOwner(await getCachedCvOwner());
