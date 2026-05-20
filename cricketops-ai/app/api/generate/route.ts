// ============================================================
// API: /api/generate — POST call Claude API or fallback
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { AGENT_CONFIGS, EventType, MatchContext, EVENT_LABELS } from '@/types';

// Rate limiting
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 10;

function checkRateLimit(): boolean {
  const now = Date.now();
  const key = 'global';
  const timestamps = rateLimitMap.get(key) || [];
  const recent = timestamps.filter((t) => now - t < 60000);
  rateLimitMap.set(key, recent);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  return true;
}

// Mock content generator — only Meme + Prediction agents
function generateMockContent(agentId: string, eventType: EventType, matchContext: MatchContext): string {
  const { team1, team2, score, overs } = matchContext;
  const mockContent: Record<string, Record<string, string[]>> = {
    meme: {
      wicket: [
        `😂 ${team2} fans celebrating that wicket like they won the IPL already. Bro, it's ${score} in ${overs} overs. Calm down.`,
        `POV: You're a ${team1} fan watching another wicket fall at ${score}. Pain. 💀`,
        `${team1} losing wickets like me losing my phone — every 5 minutes 😭`,
      ],
      six: [
        `That six was so big it probably has its own PIN code 😂 ${team1} ${score}`,
        `Bowler after conceding that six: "I didn't sign up for this" 💀 #${team1}vs${team2}`,
      ],
      dropped_catch: [
        `🤦 That dropped catch is going straight to the "Top 10 anime betrayals" compilation`,
        `Dropped catch alert! Butterfingers sponsored by ${team2} today 😂`,
      ],
      victory: [
        `${team1} won and ${team2} fans suddenly have "network issues" 😂💀 #IPL`,
        `RIP ${team2} fans' group chats right now 💀 ${team1} take it home with ${score}! 😂`,
      ],
      final_over: [
        `Last over and my heart rate is higher than the required run rate 😂 ${team1} ${score}`,
        `Final over drama! ${team1} vs ${team2} — even Netflix couldn't script this 🍿😂`,
      ],
      partnership_break: [
        `Partnership broken! ${team2} fans breathing again after 15 overs of suffering 😂`,
      ],
      milestone: [
        `Another fifty and he's celebrating like he just cleared his JEE exam 😂 #${team1} ${score}`,
      ],
      default: [
        `${team1} vs ${team2} and Twitter is ALREADY a warzone 😂 ${score} (${overs} ov)`,
      ],
    },
    prediction: {
      wicket: [
        `📊 Win probability shift: ${team1} now at ${Math.floor(Math.random() * 30 + 35)}% after that crucial wicket. ${score} in ${overs} overs — chase getting tighter.`,
        `📊 Historical data: teams losing wickets at this stage win only 28% of matches. ${team1} ${score} (${overs})`,
      ],
      strategic_timeout: [
        `📊 At this stage (${overs} ov, ${score}), teams batting first average 172. ${team1} need to accelerate NOW or risk falling short.`,
      ],
      partnership_break: [
        `📊 Partnership of 72 broken. ${team1} were scoring at 9.2 RPO during the stand. Expect a dip to 7.5 now. ${score} (${overs})`,
      ],
      final_over: [
        `📊 Teams defending this total in the last over have a 61% win record in IPL 2026. ${team1} ${score} — edge to bowlers.`,
      ],
      economy_highlight: [
        `📊 Economy of 5.2 in the powerplay — that's the 3rd best in this season's IPL. ${team1} ${score} (${overs})`,
      ],
      milestone: [
        `📊 MILESTONE: 47th fifty+ score at this venue in IPL history. This batter averaging 42.3 in the death overs this season.`,
      ],
      victory: [
        `📊 ${team1} win takes them to #2 on the points table with NRR of +0.847. Playoff probability: 94%. ${score} final.`,
      ],
      default: [
        `📊 ${team1} vs ${team2} — Current run rate: ${(parseInt(score.split('/')[0]) / parseFloat(overs) || 8).toFixed(1)}. Based on powerplay data, projected total: ${Math.floor(Math.random() * 30 + 165)}.`,
      ],
    },
  };

  const agentContent = mockContent[agentId] || mockContent.meme;
  const eventContent = agentContent[eventType] || agentContent.default || agentContent[Object.keys(agentContent)[0]];
  return eventContent[Math.floor(Math.random() * eventContent.length)];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, eventType, matchContext } = body;

    if (!agentId || !eventType || !matchContext) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!checkRateLimit()) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const agentConfig = AGENT_CONFIGS.find((a) => a.id === agentId);
    if (!agentConfig) {
      return NextResponse.json({ error: 'Unknown agent' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If we have an API key, call Claude
    if (apiKey && apiKey.startsWith('sk-ant-')) {
      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const client = new Anthropic({ apiKey });

        const userPrompt = `Create a ${agentId === 'meme' ? 'meme post' : 'win probability prediction and stat insight'} for this IPL event: ${EVENT_LABELS[eventType as EventType] || eventType}\nMatch context: ${matchContext.team1} vs ${matchContext.team2}, score ${matchContext.score} in ${matchContext.overs} overs.`;

        const message = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          system: agentConfig.systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        });

        const content = message.content[0].type === 'text' ? message.content[0].text : '';
        const confidence = Math.floor(Math.random() * 20 + 75);

        return NextResponse.json({ content, confidence });
      } catch (apiError) {
        console.error('Claude API error, falling back to mock:', apiError);
      }
    }

    // Fallback: generate mock content
    const content = generateMockContent(agentId, eventType as EventType, matchContext);
    const confidence = Math.floor(Math.random() * 30 + 60);

    return NextResponse.json({ content, confidence });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
