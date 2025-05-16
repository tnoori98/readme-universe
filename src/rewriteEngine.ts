type OpenAIResponse = {
  choices?: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
  };
};

export async function rewriteReadme(content: string, style: string, apiKey: string, model: string): Promise<string> {
  const prompt = `Rewrite the following README in a ${style} narrative style. Preserve markdown formatting.\n\nREADME:\n${content}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${errorText}`);
  }

  const json = (await res.json()) as OpenAIResponse;

  if (!json.choices || !json.choices[0]?.message?.content) {
    throw new Error(`Unexpected API response: ${JSON.stringify(json, null, 2)}`);
  }

  return json.choices[0].message.content;
}

