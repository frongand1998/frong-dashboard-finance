import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { messages, context } = await req.json();

  const systemPrompt = `You are a personal finance AI assistant built into a finance dashboard app called Frong Finance. 
You help users understand their spending, income, and financial health. Be concise, friendly, and actionable.

${context?.summary ? `## Current Financial Summary
- Total Income: ${context.summary.income}
- Total Expenses: ${context.summary.expenses}
- Net Balance: ${context.summary.net}
` : ''}

${context?.transactions?.length ? `## Recent Transactions (${context.transactions.length} total)
${context.transactions
  .slice(0, 50)
  .map((tx: { date: string; type: string; category: string; amount: number; note?: string }) =>
    `- [${tx.date}] ${tx.type === 'income' ? '+' : '-'}${tx.amount} | ${tx.category}${tx.note ? ` | ${tx.note}` : ''}`
  )
  .join('\n')}
` : ''}

${context?.categories?.length ? `## Spending by Category
${context.categories
  .map((c: { category: string; total: number }) => `- ${c.category}: ${c.total}`)
  .join('\n')}
` : ''}

Keep answers brief unless asked for detail. When making suggestions, be specific using the actual data above.
Format currency values clearly. If you don't have enough data to answer, say so honestly.`;

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
