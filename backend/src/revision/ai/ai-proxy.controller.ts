import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';

const MODELS = [
  'openai/gpt-oss-120b:free',
  'deepseek/deepseek-r1-0528:free',
  'mistralai/mistral-7b-instruct:free',
  'qwen/qwen3-coder:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
];

@Controller('revision/ai')
export class AiProxyController {

  @Post('generate')
  async generate(@Body() body: { prompt: string }) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new HttpException('Clé API OpenRouter manquante', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    let data: any = null;
    let lastError = '';

    for (const model of MODELS) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'StudyCore',
          },
          body: JSON.stringify({
            model,
            max_tokens: 4000,
            temperature: 0, 
            messages: [
              {
                role: 'system',
                content:
                  'You are a strict JSON-only API. ' +
                  'Output ONLY a raw JSON object — no markdown, no backticks, no explanation, no text before or after. ' +
                  'If the user message contains sections marked "=== DOCUMENTS DU MODULE ===", ' +
                  'you MUST base ALL questions and flashcards EXCLUSIVELY on that document content. ' +
                  'NEVER generate generic questions when document content is present in the message.',
              },
              {
                role: 'user',
                content: body.prompt,
              },
            ],
          }),
        });

        if (response.status === 429) {
          lastError = `${model} rate-limited`;
          console.warn(`Model ${model} rate-limited, trying next...`);
          continue;
        }

        if (!response.ok) {
          const err = await response.text();
          lastError = err;
          console.error(`Model ${model} error:`, response.status, err);
          continue;
        }

        data = await response.json();
        console.log(`Used model: ${model}`);
        console.log('OpenRouter raw response (first 500):', JSON.stringify(data).slice(0, 500));
        break;

      } catch (fetchErr) {
        lastError = fetchErr.message;
        console.error(`Model ${model} fetch exception:`, fetchErr.message);
        continue;
      }
    }

    if (!data) {
      throw new HttpException(
        `Tous les modèles sont indisponibles: ${lastError}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      console.error('No text in response:', JSON.stringify(data));
      throw new HttpException('Réponse vide de OpenRouter', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    console.log('AI text (first 300 chars):', text.slice(0, 300));

    return { content: [{ text }] };
  }
}