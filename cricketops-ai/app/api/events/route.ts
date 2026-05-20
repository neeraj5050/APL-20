// ============================================================
// API: /api/events — POST trigger a match event
// Handles the full pipeline: Event → Route → Task → Generate
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { EventType, MatchContext, EVENT_LABELS, AGENT_CONFIGS } from '@/types';
import { routeEvent } from '@/lib/events/eventRouter';
import { memoryStore } from '@/lib/memoryStore';

// Import the mock generator directly so we don't need to make HTTP calls
function generateMockContent(agentId: string, eventType: EventType, matchContext: MatchContext): { content: string; confidence: number } {
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
        `SIX! Even the camera man lost that one 😂 ${team1} on fire at ${score}! 🔥`,
      ],
      dropped_catch: [
        `🤦 That dropped catch is going straight to the "Top 10 anime betrayals" compilation`,
        `Dropped catch alert! Butterfingers sponsored by ${team2} today 😂`,
        `Me explaining to my ${team2} friend why that catch was easy: 🤡💀 #IPL`,
      ],
      victory: [
        `${team1} won and ${team2} fans suddenly have "network issues" 😂💀 #IPL`,
        `RIP ${team2} fans' group chats right now 💀 ${team1} take it home! 😂`,
      ],
      final_over: [
        `Last over and my heart rate is higher than the required run rate 😂 ${score}`,
        `Final over drama! Even Netflix couldn't script this 🍿😂 #${team1}vs${team2}`,
      ],
      partnership_break: [
        `Partnership broken! ${team2} fans breathing again after suffering 😂`,
        `That partnership was longer than my attention span 💀 Finally broken! #IPL`,
      ],
      milestone: [
        `Another fifty and he's celebrating like he just cleared his JEE exam 😂 ${score}`,
        `Half century! The crowd goes wild, Twitter goes wilder 😂🔥 #${team1}`,
      ],
      strategic_timeout: [
        `Strategic timeout = Me pretending to think while already knowing I'll order biryani 😂`,
        `${team1} at ${score} during timeout. Coach drawing plays, players checking Instagram 💀`,
      ],
      economy_highlight: [
        `This bowler's economy is lower than my bank balance 😂 Respect! #${team1}vs${team2}`,
      ],
    },
    prediction: {
      wicket: [
        `📊 Win probability shift: ${team1} now at ${Math.floor(Math.random() * 30 + 35)}% after that wicket. ${score} in ${overs} overs — chase getting tighter.`,
        `📊 Historical data: teams losing wickets at this stage win only 28% of IPL matches. ${team1} ${score} (${overs})`,
      ],
      strategic_timeout: [
        `📊 At ${overs} ov (${score}), teams batting first average 172 in IPL 2026. ${team1} need to accelerate NOW.`,
        `📊 Timeout analysis: Current RR ${(parseInt(score.split('/')[0]) / parseFloat(overs) || 8).toFixed(1)} vs required. ${team1} projected: ${Math.floor(Math.random() * 25 + 160)}.`,
      ],
      partnership_break: [
        `📊 Partnership broken! ${team1} were scoring at 9.2 RPO during the stand. Expect a dip to 7.5 RPO now.`,
      ],
      final_over: [
        `📊 Teams defending this total in last over: 61% win rate in IPL 2026. Edge to bowlers. ${score}`,
      ],
      economy_highlight: [
        `📊 Economy of 5.2 in powerplay — 3rd best this IPL season. ${team1} ${score} (${overs})`,
      ],
      milestone: [
        `📊 MILESTONE: 47th fifty+ at this venue in IPL history. This batter averaging 42.3 in death overs.`,
      ],
      victory: [
        `📊 ${team1} win → #2 on points table, NRR +0.847. Playoff probability: 94%. ${score} final.`,
      ],
      six: [
        `📊 That six traveled ~98m. This batter's strike rate in death overs: 186.4. ${team1} ${score}`,
      ],
      dropped_catch: [
        `📊 Dropped catches cost teams an avg 32 extra runs in IPL. This could be decisive. ${score}`,
      ],
    },
  };

  const agentContent = mockContent[agentId] || mockContent.meme;
  const pool = agentContent[eventType] || agentContent[Object.keys(agentContent)[0]];
  const content = pool[Math.floor(Math.random() * pool.length)];
  const confidence = Math.floor(Math.random() * 30 + 65);
  return { content, confidence };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, matchContext } = body as { type: EventType; matchContext: MatchContext };

    if (!type || !matchContext) {
      return NextResponse.json({ error: 'Missing type or matchContext' }, { status: 400 });
    }

    // Create event record
    const event = {
      type,
      label: EVENT_LABELS[type] || type,
      triggeredAgent: '',
      timestamp: new Date().toISOString(),
      matchData: matchContext,
    };

    // Route to agents and create tasks
    const tasks = routeEvent(type, matchContext);

    if (tasks.length > 0) {
      event.triggeredAgent = tasks[0].agent;
    }

    memoryStore.createEvent(event);

    // Save all tasks
    const createdTasks = tasks.map((t) => memoryStore.createTask(t));

    // Process tasks asynchronously (simulate AI pipeline)
    for (const task of createdTasks) {
      processTaskPipeline(task.id, task.agentId, type, matchContext);
    }

    return NextResponse.json({ event, tasks: createdTasks }, { status: 201 });
  } catch (error) {
    console.error('Error triggering event:', error);
    return NextResponse.json({ error: 'Failed to trigger event' }, { status: 500 });
  }
}

async function processTaskPipeline(
  taskId: string,
  agentId: string,
  eventType: EventType,
  matchContext: MatchContext
) {
  // Delay before processing (simulates "thinking")
  await new Promise((r) => setTimeout(r, 800));

  // Move to PROCESSING
  memoryStore.updateTask(taskId, {
    status: 'PROCESSING',
    processedAt: new Date().toISOString(),
  });

  try {
    const startTime = Date.now();

    // Generate content directly (no HTTP call needed)
    const { content, confidence } = generateMockContent(agentId, eventType, matchContext);

    // Simulate generation delay
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 1500));

    const genTime = Date.now() - startTime;

    // Move to POSTED
    memoryStore.updateTask(taskId, {
      status: 'POSTED',
      content,
      confidence,
      postedAt: new Date().toISOString(),
    });

    // Update agent stats
    const stats = memoryStore.getAgentStat(agentId);
    if (stats) {
      const newTotal = stats.totalTasks + 1;
      const newAvg = Math.round((stats.avgGenTime * stats.totalTasks + genTime) / newTotal);
      memoryStore.updateAgentStats(agentId, {
        tasksToday: stats.tasksToday + 1,
        totalTasks: newTotal,
        avgGenTime: newAvg,
        lastTriggered: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error in task pipeline:', error);
    const agentConfig = AGENT_CONFIGS.find((a) => a.id === agentId);
    memoryStore.updateTask(taskId, {
      status: 'POSTED',
      content: `${agentConfig?.emoji || '🏏'} ${matchContext.team1} vs ${matchContext.team2} — What a moment! ${EVENT_LABELS[eventType]} #IPL #Cricket`,
      confidence: 50,
      postedAt: new Date().toISOString(),
    });
  }
}
