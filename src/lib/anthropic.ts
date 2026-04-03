const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1';

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicConfig {
  model: string;
  system?: string;
  messages: AnthropicMessage[];
  temperature?: number;
  max_tokens: number;
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
}

/**
 * Call Anthropic API (non-streaming) for analysis
 */
export async function callAnthropic(config: AnthropicConfig): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY');

  const body: Record<string, unknown> = {
    model: config.model,
    max_tokens: config.max_tokens,
    messages: config.messages,
  };
  if (config.system) body.system = config.system;
  if (config.temperature !== undefined) body.temperature = config.temperature;

  const res = await fetch(`${ANTHROPIC_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as AnthropicResponse;
  return data.content.map(c => c.text).join('');
}

/**
 * Stream Anthropic API for chat
 */
export function streamAnthropic(config: AnthropicConfig): ReadableStream<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY');

  return new ReadableStream<string>({
    async start(controller) {
      try {
        const body: Record<string, unknown> = {
          model: config.model,
          max_tokens: config.max_tokens,
          messages: config.messages,
          stream: true,
        };
        if (config.system) body.system = config.system;
        if (config.temperature !== undefined) body.temperature = config.temperature;

        const res = await fetch(`${ANTHROPIC_BASE_URL}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Anthropic API error ${res.status}: ${err}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  controller.enqueue(parsed.delta.text);
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
