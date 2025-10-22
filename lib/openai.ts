import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Please define the OPENAI_API_KEY environment variable inside .env.local");
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export default openai;
