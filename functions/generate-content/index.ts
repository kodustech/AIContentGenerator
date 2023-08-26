// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4.2.0'

const configuration = new Configuration({
  organization: "org-BTicGkvgtmHHY4EkKFTa4dBL",
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

serve(async (req) => {
  const { query } = await req.json();

  const openai = new OpenAIApi(configuration);

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "Say Hello World! in portuguese." }],
    model: "gpt-3.5-turbo-16k-0613",
  });

  return new Response(completion.choices[0])

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
