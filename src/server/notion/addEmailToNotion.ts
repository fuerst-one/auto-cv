"use server";

import { createNotionPage } from "./utils/createNotionPage";

export const addEmailToNotion = async (email: string) => {
  await createNotionPage(process.env.NEXT_NOTION_CV_SIGNUP_DATABASE_ID!, {
    createdAt: {
      type: "date",
      date: {
        start: new Date().toISOString(),
      },
    },
    email: {
      type: "email",
      email,
    },
  });
};
