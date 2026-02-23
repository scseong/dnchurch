const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

export const getCloudinaryUrl = (publicId: string) => `${BASE_URL}/${publicId}`;

export const getCloudinaryDownloadUrl = (publicId: string) =>
  `${BASE_URL}/fl_attachment/${publicId}`;
