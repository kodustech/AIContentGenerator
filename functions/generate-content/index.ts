// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from 'https://esm.sh/openai@4.2.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
}

const persona = 'CTO and Engineering Leaders';
const tone_of_voice = 'Professional';
const writing_style = 'Informative and Technical';
const language = 'Brazilian-Portuguese'
let _topic = '';
let _title = '';
let _outline = '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
  });

  const { type, topic, title, outline } = await req.json();

  console.log(topic);

  _topic = topic;
  _title = title;
  _outline = outline;

  const prompt_generate_title = `Please ignore all previous instructions. 
You are an expert copywriter who writes catchy titles for blog posts.
You have ${persona} as a persona.
You have a ${tone_of_voice} tone of voice. You have a ${writing_style} writing style. 
Write 10 catchy blog post titles with a hook for the topic "${_topic}". 
The titles should be written in the ${language} language. 
The titles should be less than 60 characters. 
The titles should include the words from the topic "${_topic}".
The titles should be in javascript array format.
When I send you a software engineering term, keep the term in english.
Do not use single quotes, double quotes or any other enclosing characters. 
Do not self reference. Do not explain what you are doing.`

  const prompt_generate_outline = `Please ignore all previous instructions. 
You are an expert copywriter who creates content outlines.
You have ${persona} as a persona.
You have a ${tone_of_voice} tone of voice. You have a ${writing_style} writing style. 
Create a long form content outline in the ${language} language for the blog post titled "${_title}". 
The content outline should include a minimum of 20 headings and subheadings. 
The content should include this keyword: ${topic}.
When I send you a software engineering term, keep the term in english.
The outline should be extensive and it should cover the entire topic. 
Create detailed subheadings that are engaging and catchy. 
Do not write the blog post, please only write the outline of the blog post. 
The outline must be in HTML.
Do not number the headings. 
Please add a newline space between headings and subheadings. 
Do not self reference. Do not explain what you are doing.
Respond with the content inside a JSON for example: 
{content:  "outline"}`

  const prompt_generate_post = `Please ignore all previous instructions. 
You are an expert copywriter who writes detailed and thoughtful blog articles.
You have ${persona} as a persona.
You have a ${tone_of_voice} tone of voice. You have a ${writing_style} writing style. 
I will give you an outline for an article and I want you to expand in the ${language} language on each of the subheadings to create a complete article from it. 
Please intersperse short and long sentences. Utilize uncommon terminology to enhance the originality of the content. 
Please format the content in a professional format.
The article must have at least 1000 words and follow SEO best practices.
The content must be in HTML. 
Do not number the headings. 
Do not self reference. 
Do not explain what you are doing. 
Respond with the content inside a JSON for example: 
{content:  "article"}
The blog article outline is - "${_outline}"`

  const prompt_generate_metadescription = `Please ignore all previous instructions. 
You are an expert copywriter who writes meta descriptions. 
You have ${persona} as a persona.
You have a ${tone_of_voice} tone of voice. You have a ${writing_style} writing style. 
Write a meta description for the blog post titled ${_title}.
The description should be written in the ${language} and be less than 160 characters.`

  let prompt = '';

  if (type === 'title') {
    prompt = prompt_generate_title;
  } else if (type === 'outline') {
    prompt = prompt_generate_outline;
  } else if (type === 'post') {
    prompt = prompt_generate_post;
  } else if (type === 'meta') {
    prompt = prompt_generate_metadescription;
  }


  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "gpt-3.5-turbo-16k-0613",
  });

  console.log(completion.choices[0]);
  return new Response(completion.choices[0].message.content, { headers: corsHeaders })
})

// To invoke:
// curl - i--location--request POST 'http://localhost:54321/functions/v1/generate-content' \
// --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
// --header 'Content-Type: application/json' \
// --data '{"name":"Functions"}'
