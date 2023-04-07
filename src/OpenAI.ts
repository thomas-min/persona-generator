import { Configuration, CreateImageRequestSizeEnum, OpenAIApi } from "openai";

export class OpenAI {
  private openAI: OpenAIApi;

  constructor(apiKey: string) {
    this.openAI = new OpenAIApi(new Configuration({ apiKey }));
  }
  async generateText({
    prompt,
    model,
    maxTokens,
    temperature,
  }: {
    prompt: string;
    model: string;
    maxTokens: number;
    temperature: number;
  }) {
    try {
      const response = await this.openAI.createCompletion({
        model,
        prompt,
        max_tokens: maxTokens,
        n: 1,
        temperature,
      });
      if (response.data.usage) {
        console.log(`request cost: ${response.data.usage.total_tokens} tokens`);
      }
      return response.data.choices[0].text;
    } catch (error) {
      throw error;
    }
  }

  async generateImage({
    prompt,
    size,
  }: {
    prompt: string;
    size: CreateImageRequestSizeEnum;
  }) {
    const cost =
      size === "256x256" ? "$0.016" : size === "512x512" ? "$0.018" : "$0.020";

    try {
      const response = await this.openAI.createImage({
        prompt,
        size,
      });

      console.log(`request cost : ${cost}`);

      return response.data.data[0].url;
    } catch (error) {
      throw error;
    }
  }
}
