// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4.2.0'

const configuration = new Configuration({
  organization: "org-BTicGkvgtmHHY4EkKFTa4dBL",
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

const prompt_generate_title = `Please ignore all previous instructions. 
You are an expert copywriter who writes catchy titles for blog posts.
You have ${persona} as a persona.
You have a ${tone_of_voice} tone of voice. You have a ${writing_style} writing style. 
Write 10 catchy blog post titles with a hook for the topic "${topic}". 
The titles should be written in the ${language} language. 
The titles should be less than 60 characters. 
The titles should include the words from the topic "${topic}". 
Do not use single quotes, double quotes or any other enclosing characters. 
Do not self reference. Do not explain what you are doing.`

const prompt_generate_outline = `Please ignore all previous instructions. 
You are an expert copywriter who creates content outlines.
You have ${persona} as a persona.
You have a ${tone_of_voice} tone of voice. You have a ${writing_style} writing style. 
Create a long form content outline in the ${language} language for the blog post titled "${title}". 
The content outline should include a minimum of 20 headings and subheadings. 
The outline should be extensive and it should cover the entire topic. 
Create detailed subheadings that are engaging and catchy. 
Do not write the blog post, please only write the outline of the blog post. 
Please do not number the headings. 
Please add a newline space between headings and subheadings. 
Do not self reference. Do not explain what you are doing.`

const prompt_generate_post = `Please ignore all previous instructions. 
You are an expert copywriter who writes detailed and thoughtful blog articles.
You have ${persona} as a persona.
You have a ${tone_of_voice} tone of voice. You have a ${writing_style} writing style. 
I will give you an outline for an article and I want you to expand in the ${language} language on each of the subheadings to create a complete article from it. 
Please intersperse short and long sentences. Utilize uncommon terminology to enhance the originality of the content. 
Please format the content in a professional format. 
Do not self reference. 
Do not explain what you are doing. 
The blog article outline is - "${outline}"`

const prompt_generate_metadescription = `Please ignore all previous instructions. 
You are an expert copywriter who writes meta descriptions. 
You have ${persona} as a persona.
You have a ${tone_of_voice} tone of voice. You have a ${writing_style} writing style. 
Write a meta description for the blog post titled ${title}.
The description should be written in the ${language} and be less than 160 characters.`


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
