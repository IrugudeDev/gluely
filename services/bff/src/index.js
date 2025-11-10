import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { nanoid } from 'nanoid';
import { WebSocketServer } from 'ws';
import { SuggestionKind, createSuggestion, formatTimestamp } from '@gluely/shared';

const app = express();
app.use(cors());
app.use(express.json());

const meetings = new Map();

app.post('/api/meetings/start', (req, res) => {
  const id = nanoid();
  const meeting = {
    id,
    startedAt: Date.now(),
    transcript: [],
    hints: [],
  };
  meetings.set(id, meeting);
  res.json({ meeting_id: id });
});

app.post('/api/meetings/:id/notes', (req, res) => {
  const meeting = meetings.get(req.params.id);
  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }
  const summary = meeting.transcript.slice(-10).map((chunk, idx) => `${idx + 1}. ${chunk.text}`).join('\n');
  res.json({
    meeting_id: meeting.id,
    notes: `# Summary\n${summary || 'No transcript recorded yet.'}\n\n## Action Items\n- TBD`,
  });
});

app.post('/api/meetings/:id/followup', (req, res) => {
  const meeting = meetings.get(req.params.id);
  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }
  res.json({
    meeting_id: meeting.id,
    subject: 'Great meeting! Next steps',
    body: `Hi there,\n\nThanks for the meeting. Here are our next steps:\n${meeting.hints.map((hint) => `- ${hint.text}`).join('\n') || '- TBD'}\n\nBest,\nYour Copilot`,
  });
});

app.get('/api/meetings/:id/export', (req, res) => {
  const meeting = meetings.get(req.params.id);
  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }
  const format = req.query.fmt || 'md';
  res.setHeader('content-type', 'text/plain');
  res.send(`# Meeting ${meeting.id}\nFormat: ${format}\nStarted: ${new Date(meeting.startedAt).toISOString()}\nNotes: TBD`);
});

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/api/meetings/stream' });

wss.on('connection', (socket) => {
  let intervalId;
  socket.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'subscribe' && message.meetingId) {
        const meeting = meetings.get(message.meetingId);
        if (!meeting) {
          socket.send(JSON.stringify({ type: 'error', error: 'Meeting not found' }));
          return;
        }
        intervalId = setInterval(() => {
          const timestamp = Date.now() - meeting.startedAt;
          const hint = createSuggestion({
            id: nanoid(),
            kind: SuggestionKind.QA,
            text: `Example hint at ${formatTimestamp(timestamp)}`,
            confidence: Math.random().toFixed(2),
          });
          meeting.hints.push(hint);
          socket.send(JSON.stringify({
            type: 'suggestion',
            suggestion: hint,
            meetingId: meeting.id,
          }));
        }, 5000);
      }
    } catch (err) {
      socket.send(JSON.stringify({ type: 'error', error: err.message }));
    }
  });

  socket.on('close', () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });
});

const PORT = process.env.PORT || 8787;
httpServer.listen(PORT, () => {
  console.log(`BFF listening on http://localhost:${PORT}`);
});
