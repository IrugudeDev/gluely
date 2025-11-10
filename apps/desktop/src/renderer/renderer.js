import { SuggestionKind } from '@gluely/shared';

const transcriptEl = document.getElementById('transcriptList');
const suggestionEl = document.getElementById('suggestionList');
const statusEl = document.getElementById('status');
const copyButton = document.getElementById('copyButton');
const followupButton = document.getElementById('followupButton');
const closeButton = document.getElementById('closeButton');
const notesEl = document.getElementById('notes');

const meetingState = {
  meetingId: null,
  suggestions: [],
  transcript: [],
};

async function startMeeting() {
  const response = await fetch('http://localhost:8787/api/meetings/start', {
    method: 'POST',
  });
  const data = await response.json();
  meetingState.meetingId = data.meeting_id;
  statusEl.textContent = 'Connected';
  openSocket();
}

function renderSuggestions() {
  suggestionEl.innerHTML = '';
  meetingState.suggestions.slice(-6).forEach((suggestion) => {
    const container = document.createElement('div');
    container.className = 'suggestion';

    const text = document.createElement('span');
    text.textContent = suggestion.text;

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = `${suggestion.kind.toUpperCase()} · ${(suggestion.confidence * 100).toFixed(0)}%`;

    container.appendChild(text);
    container.appendChild(badge);
    suggestionEl.appendChild(container);
  });
}

function renderTranscript() {
  transcriptEl.innerHTML = '';
  meetingState.transcript.slice(-10).forEach((item) => {
    const div = document.createElement('div');
    div.className = 'transcript-item';
    div.textContent = item.text;
    transcriptEl.appendChild(div);
  });
}

function openSocket() {
  if (!meetingState.meetingId) return;
  const socket = new WebSocket('ws://localhost:8787/api/meetings/stream');
  socket.addEventListener('open', () => {
    statusEl.textContent = 'Streaming';
    socket.send(JSON.stringify({ type: 'subscribe', meetingId: meetingState.meetingId }));
  });

  socket.addEventListener('message', (event) => {
    const payload = JSON.parse(event.data);
    if (payload.type === 'suggestion') {
      meetingState.suggestions.push(payload.suggestion);
      renderSuggestions();
    } else if (payload.type === 'transcript') {
      meetingState.transcript.push(payload.chunk);
      renderTranscript();
    } else if (payload.type === 'error') {
      statusEl.textContent = payload.error;
    }
  });

  socket.addEventListener('close', () => {
    statusEl.textContent = 'Disconnected';
  });
}

copyButton.addEventListener('click', async () => {
  const last = meetingState.suggestions.at(-1);
  if (!last) return;
  await navigator.clipboard.writeText(last.text);
  statusEl.textContent = 'Copied to clipboard';
  setTimeout(() => (statusEl.textContent = 'Streaming'), 1500);
});

followupButton.addEventListener('click', async () => {
  if (!meetingState.meetingId) return;
  const response = await fetch(`http://localhost:8787/api/meetings/${meetingState.meetingId}/followup`, {
    method: 'POST',
  });
  const data = await response.json();
  notesEl.value = `${data.subject}\n\n${data.body}`;
});

closeButton.addEventListener('click', () => {
  window.close();
});

if (window.gluely?.onHotkey) {
  window.gluely.onHotkey(({ action }) => {
    if (action === 'compose-reply') {
      const sample = {
        id: crypto.randomUUID(),
        kind: SuggestionKind.QA,
        text: 'Sure, let me clarify the implementation timeline for you.',
        confidence: 0.7,
      };
      meetingState.suggestions.push(sample);
      renderSuggestions();
    }
    if (action === 'add-note') {
      notesEl.value += `\n• ${new Date().toLocaleTimeString()} — Follow up on pricing deck.`;
    }
  });
}

startMeeting().catch((error) => {
  statusEl.textContent = `Error: ${error.message}`;
});
