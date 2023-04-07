import type { NextApiRequest, NextApiResponse } from "next";
import { UserPersona } from "@/types";
import { OpenAI } from "../../OpenAI";

type Data = {
  response: string;
  data?: UserPersona;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (process.env.OPEN_AI_API_KEY === undefined) {
    throw new Error("OPENAI_API_KEY is undefined");
  }

  if (req.method !== "POST") {
    res.status(405).json({ response: "Method not allowed" });
    return;
  }

  const { description } = req.body;
  console.log(description);
  const openAI = new OpenAI(process.env.OPEN_AI_API_KEY);

  const prompt = generatePrompt(description);
  const model = "text-davinci-003";
  const maxTokens = 800;
  const temperature = 0.85;

  const responseString = await openAI.generateText({
    prompt,
    model,
    maxTokens,
    temperature,
  });

  if (responseString === undefined) {
    res.status(500).json({ response: "Error generating text" });
    return;
  }

  console.log(responseString);

  const userPersona: UserPersona = JSON.parse(responseString);

  const profileImagePrompt = `Profile picture of ${userPersona.name}, ${userPersona.age} ${userPersona.gender} ${userPersona.job}}`;

  const profileImage = await openAI.generateImage({
    prompt: profileImagePrompt,
    size: "256x256",
  });

  userPersona.profileImage = profileImage;

  console.log(userPersona);

  res.status(200).json({ response: "Success", data: userPersona });
}

function generatePrompt(description: string) {
  return `
  Generate user persona for ${description} with name, gender, age, reason for using product, pain points, bio, job title.
  Elaborate on unique pain points product solves. 
  Return JSON:
  {
    "name": string,
    "gender": string,
    "age": number,
    "reason": string,
    "pains": [string],
    "bio": string,
    "job": string
  }
  `;
}
