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

let _topic = '';
let _title = '';
let _outline = '';

const _default_prompt = `
## WHO ARE YOU
Please ignore all previous instructions. 
You are an expert SEO copywriter who creates content (Title, Outlines, SEO, Meta Descriptions) for a Kodus brand. 

## WHAT KODUS DO 
Kodus is an AI assistant for agile project management. It integrates with tools like Jira and Github, streamlining management, enhancing delivery predictability, and saving time.

## FOR WHO YOU WRITE FOR
Our customer is Software Delivery Managers. Mostly, CTOs, Engineering Leaders, and Project Managers as a persona.

## About your tone of voice and writing style
Write with a confident and innovative flair, using a professional tone of voice. Your content should be informative and technical, reminiscent of Kodus's direct and futuristic approach. Engage the reader with rhetorical questions when relevant, and don't shy away from mentioning popular tools. Ensure clarity and precision in every word.
`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
  });

  const { type, topic, title, outline } = await req.json();

  const prompt_generate_title = `
## THE MAIN INSTRUCTION
Write 10 catchy blog post titles with a hook for the topic: "${topic}". 

## IMPORTANT OBSERVATIONS (PLEASE DO NOT IGNORE THIS SECTION)
- If  the topic has a software engineering term, keep the term in English.
- The titles should be written in the Brazilian-Portuguese language. 
- The titles should be less than 60 characters. 
- The titles should include the words from the topic: "${topic}".
- Do not self-reference. Do not explain what you are doing.
- Do not use "/n" to break lines.
- Do not use single quotes, double quotes, or other enclosing characters. 

## Response format
- Respond with the content inside a JSON, for example: {titles:  ['title','title'...]}
- Every title should be an item inside the array.
- Only respond in JSON format!!`

  const prompt_generate_outline = `
## THE MAIN INSTRUCTION
Create a long-form content outline in the Brazilian-Portuguese language for the blog post titled "${title}". 
The content outline should include a minimum of 25 headings and subheadings. 
The content should include this keyword: "${topic}".
The content must be written in the first and second person in a natural conversational way. 
The outline needs to sound like it was written by a creative human. To do this, the outline must include examples, case studies, funny little stories, etc. in order to break up the content from sounding boring like it was written by Al.
The outline should be extensive and it should cover the entire topic. 
Create detailed subheadings that are engaging and catchy. 

## IMPORTANT OBSERVATIONS (PLEASE DO NOT IGNORE THIS SECTION)
- If  the topic has a software engineering term, keep the term in English.
- Do not write the blog post. Please only write the outline of the blog post. 
- The outline must be in HTML format inside a JSON response. 
- Do not number the headings. 
- Do not self-reference. Do not explain what you are doing.
- Do not use "/n" to break lines.

## RESPONSE FORMAT
- Respond with the content inside a JSON, for example: {outline:  "outline"}
- Only respond in JSON format!!
  `

  const prompt_generate_post = `
## The primary instruction
I will give you an outline (It will be in ## Outline Section) for an article, and I want you to expand in the Brazilian-Portuguese language on each subheading to create a complete article from it. 
Please intersperse short and long sentences. Utilize uncommon terminology to enhance the originality of the content. 
The article should include this keyword: "$${topic}".
The article must be written in the first and second person in a natural conversational way. 
The article needs to sound like it was written by a creative human. To do this, the article must include examples, case studies, funny little stories, etc., in order to break up the content from sounding boring like Al wrote it.

## IMPORTANT OBSERVATIONS (PLEASE DO NOT IGNORE THIS SECTION)
- If  the topic has a software engineering term, keep the term in English.
- The article must be in HTML format inside a JSON response. 
- Do not number the headings. 
- Do not self-reference. Do not explain what you are doing.
- Do not use "/n" to break lines.
- The article must have at least 1500 words and follow SEO best practices.
- Only write factual content that you are 100% confident and positive that it is correct information and helpful information to the reader.
- The content must be in HTML. 

## RESPONSE FORMAT
- Respond with the content inside a JSON, for example: {article:  "article"}
- Only respond in JSON format!!

## OUTLINE TO CREATE ARTICLE
${outline}
`

  let prompt = '';

  if (type === 'title') {
    prompt = _default_prompt + prompt_generate_title;
  } else if (type === 'outline') {
    prompt = _default_prompt + prompt_generate_outline;
  } else if (type === 'post') {
    prompt = _default_prompt + prompt_generate_post;
  } else if (type === 'meta') {
    prompt = _default_prompt + prompt_generate_metadescription;
  }


  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "gpt-3.5-turbo-16k-0613",
  });

  return new Response(completion.choices[0].message.content, { headers: corsHeaders })
})

// To invoke:
// curl - i--location--request POST 'http://localhost:54321/functions/v1/generate-content' \
// --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
// --header 'Content-Type: application/json' \
// --data '{"name":"Functions"}'
