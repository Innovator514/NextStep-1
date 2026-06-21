/* ═══════════════════════════════════════════════════
     STATE
  ═══════════════════════════════════════════════════ */
  const STORAGE_KEY = 'compass_chats_v2';

  let chats = loadChats();          // { id, title, messages[], createdAt, updatedAt }
  let activeChatId = null;
  let renameTargetId = null;
  let isResponding = false;
  let currentUserId = null; // tracks logged-in Firebase user

  /* ═══════════════════════════════════════════════════
     PERSISTENCE — localStorage (guest) + Firestore (logged in)
  ═══════════════════════════════════════════════════ */
  function loadChats() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  }

  function saveChats() {
    // Always save to localStorage as a fast local cache
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(chats)); } catch {}
    // Also sync to Firestore if logged in
    if (currentUserId) syncToFirestore();
  }

  // Sync all chats to Firestore under users/{uid}/compass_chats
  async function syncToFirestore() {
    try {
      const { getFirestore, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const db = getFirestore();
      const ref = doc(db, 'users', currentUserId, 'compass', 'chats');
      await setDoc(ref, { chats: chats, updatedAt: Date.now() });
    } catch (e) {
      console.warn('Compass: Firestore sync failed, using localStorage only', e);
    }
  }

  // Load chats from Firestore for logged-in user
  async function loadFromFirestore(uid) {
    try {
      const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const db = getFirestore();
      const ref = doc(db, 'users', uid, 'compass', 'chats');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        chats = data.chats || [];
        // Sync to localStorage cache
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(chats)); } catch {}
        renderHistory();
      }
    } catch (e) {
      console.warn('Compass: Could not load from Firestore, using localStorage', e);
    }
  }

  // Watch Firebase auth state to load/unload user chats
  (async function watchAuth() {
    try {
      const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          currentUserId = user.uid;
          loadFromFirestore(user.uid);
        } else {
          currentUserId = null;
          // Load from localStorage for guest users
          chats = loadChats();
          renderHistory();
        }
      });
    } catch (e) {
      console.warn('Compass: Auth watch failed', e);
    }
  })();

  function getChat(id) { return chats.find(c => c.id === id); }

  function createChat() {
    const chat = {
      id: 'chat_' + Date.now(),
      title: 'New conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    chats.unshift(chat);
    saveChats();
    return chat;
  }

  function updateChatTitle(id, title) {
    const c = getChat(id);
    if (c) { c.title = title.slice(0, 55); c.updatedAt = Date.now(); saveChats(); }
  }

  function deleteChat(id) {
    chats = chats.filter(c => c.id !== id);
    saveChats();
    if (activeChatId === id) {
      activeChatId = null;
      showWelcome();
    }
    renderHistory();
  }

  /* ═══════════════════════════════════════════════════
     HISTORY SIDEBAR
  ═══════════════════════════════════════════════════ */
  function renderHistory(filter = '') {
    const container = document.getElementById('historyList');
    const query = filter.toLowerCase();

    const filtered = chats.filter(c =>
      c.title.toLowerCase().includes(query) ||
      (c.messages[0]?.content || '').toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:32px 16px;color:var(--text-3);font-size:0.83rem;">
          ${filter ? 'No matches found' : 'No conversations yet'}
        </div>`;
      return;
    }

    /* Group by time */
    const now = Date.now();
    const groups = { Today: [], Yesterday: [], 'This week': [], Older: [] };

    filtered.forEach(c => {
      const diff = now - c.updatedAt;
      const days = diff / 86400000;
      if (days < 1) groups['Today'].push(c);
      else if (days < 2) groups['Yesterday'].push(c);
      else if (days < 7) groups['This week'].push(c);
      else groups['Older'].push(c);
    });

    let html = '';
    Object.entries(groups).forEach(([label, items]) => {
      if (!items.length) return;
      html += `<div class="history-group-label">${label}</div>`;
      items.forEach(c => {
        const preview = c.messages.find(m => m.role === 'user')?.content || '';
        const isActive = c.id === activeChatId;
        html += `
          <div class="history-item${isActive ? ' active' : ''}" onclick="loadChat('${c.id}')">
            <div class="history-item-icon"><i class="fas fa-message"></i></div>
            <div class="history-item-text">
              <div class="history-item-title">${escHtml(c.title)}</div>
              <div class="history-item-preview">${escHtml(preview.slice(0, 48))}${preview.length > 48 ? '…' : ''}</div>
            </div>
            <div class="history-item-actions">
              <button class="history-action-btn" title="Rename"
                onclick="event.stopPropagation(); openRenameModal('${c.id}')">
                <i class="fas fa-pen"></i>
              </button>
              <button class="history-action-btn danger" title="Delete"
                onclick="event.stopPropagation(); confirmDelete('${c.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>`;
      });
    });

    container.innerHTML = html;
  }

  function filterHistory(q) { renderHistory(q); }

  /* ═══════════════════════════════════════════════════
     CHAT MANAGEMENT
  ═══════════════════════════════════════════════════ */
  function startNewChat() {
    const chat = createChat();
    activeChatId = chat.id;
    showWelcome();
    document.getElementById('chatTitleDisplay').textContent = 'New conversation';
    renderHistory();
    closeMobileSidebar();
  }

  function loadChat(id) {
    const chat = getChat(id);
    if (!chat) return;
    activeChatId = id;
    document.getElementById('chatTitleDisplay').textContent = chat.title;

    const msgsEl = document.getElementById('chatMessages');
    const welcomeEl = document.getElementById('welcomeScreen');

    if (chat.messages.length === 0) {
      showWelcome();
    } else {
      welcomeEl.classList.add('hidden');
      msgsEl.classList.remove('hidden');
      msgsEl.innerHTML = '';
      chat.messages.forEach(m => renderBubble(m.role, m.content, false));
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    renderHistory();
    closeMobileSidebar();
  }

  function clearCurrentChat() {
    if (!activeChatId) return;
    const c = getChat(activeChatId);
    if (!c) return;
    if (!confirm('Clear this conversation?')) return;
    c.messages = [];
    c.title = 'New conversation';
    c.updatedAt = Date.now();
    saveChats();
    showWelcome();
    document.getElementById('chatTitleDisplay').textContent = 'New conversation';
    renderHistory();
  }

  function confirmDelete(id) {
    if (confirm('Delete this conversation?')) deleteChat(id);
  }

  function showWelcome() {
    document.getElementById('welcomeScreen').classList.remove('hidden');
    document.getElementById('chatMessages').classList.add('hidden');
    document.getElementById('chatMessages').innerHTML = '';
  }

  /* ═══════════════════════════════════════════════════
     SENDING & RENDERING
  ═══════════════════════════════════════════════════ */
  function sendSuggestion(btn) {
    const text = btn.querySelector('.chip-title').textContent;
    document.getElementById('userInput').value = text;
    sendMessage();
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    updateSendBtn();
  }

  function autoResize(ta) {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
    updateSendBtn();
  }

  function updateCharCount(ta) {
    const n = ta.value.length;
    const el = document.getElementById('charCount');
    el.textContent = n > 200 ? n : '';
    updateSendBtn();
  }

  function updateSendBtn() {
    const val = document.getElementById('userInput').value.trim();
    document.getElementById('sendBtn').disabled = !val || isResponding;
  }

  function clearInput() {
    const ta = document.getElementById('userInput');
    ta.value = '';
    ta.style.height = 'auto';
    document.getElementById('charCount').textContent = '';
    updateSendBtn();
    ta.focus();
  }

  async function sendMessage() {
    const ta = document.getElementById('userInput');
    const text = ta.value.trim();
    if (!text || isResponding) return;

    /* Ensure we have an active chat */
    if (!activeChatId) {
      const chat = createChat();
      activeChatId = chat.id;
    }

    const chat = getChat(activeChatId);

    /* Hide welcome, show messages */
    document.getElementById('welcomeScreen').classList.add('hidden');
    const msgsEl = document.getElementById('chatMessages');
    msgsEl.classList.remove('hidden');

    /* Push user message */
    const userMsg = { role: 'user', content: text, ts: Date.now() };
    chat.messages.push(userMsg);
    saveChats();
    renderBubble('user', text);

    /* Auto-title from first user message */
    if (chat.messages.filter(m => m.role === 'user').length === 1) {
      const autoTitle = text.length > 50 ? text.slice(0, 50) + '…' : text;
      updateChatTitle(activeChatId, autoTitle);
      document.getElementById('chatTitleDisplay').textContent = chat.title;
      renderHistory();
    }

    clearInput();
    isResponding = true;
    updateSendBtn();

    /* Typing indicator */
    const typingId = 'typing_' + Date.now();
    const typingRow = document.createElement('div');
    typingRow.className = 'msg-row bot';
    typingRow.id = typingId;
    typingRow.innerHTML = `
      <div class="msg-avatar"><i class="fas fa-compass"></i></div>
      <div class="msg-bubble-wrap">
        <div class="typing-bubble">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>`;
    msgsEl.appendChild(typingRow);
    msgsEl.scrollTop = msgsEl.scrollHeight;

    /* Call API */
    let reply = '';
    try {
      reply = await callCompassAPI(chat.messages);
    } catch (err) {
      reply = 'Sorry, I had trouble connecting. Please try again in a moment.';
      console.error('Compass API error:', err);
    }

    /* Remove typing, render reply */
    document.getElementById(typingId)?.remove();

    const botMsg = { role: 'assistant', content: reply, ts: Date.now() };
    chat.messages.push(botMsg);
    chat.updatedAt = Date.now();
    saveChats();
    renderBubble('bot', reply);

    isResponding = false;
    updateSendBtn();
    renderHistory();
  }

  function renderBubble(role, content, scroll = true) {
    const msgsEl = document.getElementById('chatMessages');
    const row = document.createElement('div');
    row.className = `msg-row ${role === 'user' ? 'user' : 'bot'}`;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const avatarHTML = role === 'user'
      ? `<div class="msg-avatar"><i class="fas fa-user"></i></div>`
      : `<div class="msg-avatar"><i class="fas fa-compass"></i></div>`;

    row.innerHTML = `
      ${role === 'bot' ? avatarHTML : ''}
      <div class="msg-bubble-wrap">
        <div class="msg-bubble">${formatContent(content)}</div>
        <div class="msg-meta">${time}</div>
      </div>
      ${role === 'user' ? avatarHTML : ''}
    `;

    msgsEl.appendChild(row);
    if (scroll) msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function formatContent(text) {
    /* Very light markdown-to-HTML */
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '• $1')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>').replace(/$/, '</p>');
  }

  /* ═══════════════════════════════════════════════════
     API CALL — via Puter.js (no API key needed)
  ═══════════════════════════════════════════════════ */
  async function callCompassAPI(messages) {
    const systemPrompt = `You are Compass, NextStep's AI civic guide for Boca Raton, Florida.
You help residents discover local events, understand how local government works, find volunteer opportunities, learn about civic engagement, and navigate the NextStep platform.

Key facts about NextStep:
- NextStep is a civic engagement platform focused on Boca Raton, FL
- Features: interactive event map, event listings, badge system for engagement, the podium, and Compass (you)
- Event categories: Political, Youth, Innovation, Environmental, Education, Religious
- Users earn badges by attending events, volunteering, speaking at town halls, and other civic actions
- The platform uses Firebase for auth and Firestore for data

Personality: Warm, knowledgeable, concise. You care deeply about local democracy. Use plain language. Avoid jargon. When you don't know specific local details (like exact dates), say so honestly and direct the user to check the Events page or official city sources.

Keep responses focused and conversational. Use bullet points sparingly. Aim for 2-4 paragraphs unless a list genuinely helps.`;

    const apiMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }));

    // Build a single prompt string: system context + full conversation history
    const fullPrompt = [
      `[SYSTEM]\n${systemPrompt}`,
      ...apiMessages.map(m => `[${m.role.toUpperCase()}]\n${m.content}`)
    ].join('\n\n');

    const response = await puter.ai.chat(fullPrompt, {
      model: 'claude-sonnet-4-20250514'
    });

    // puter.ai.chat may return a string or a structured object
    if (typeof response === 'string') return response;
    return response?.message?.content?.[0]?.text
      || response?.text
      || response?.content?.[0]?.text
      || "I didn't get a response. Please try again.";
  }

  /* ═══════════════════════════════════════════════════
     EXPORT
  ═══════════════════════════════════════════════════ */
  function exportChat() {
    if (!activeChatId) return;
    const chat = getChat(activeChatId);
    if (!chat || !chat.messages.length) {
      alert('Nothing to export yet.');
      return;
    }
    const lines = [`# ${chat.title}\n`, `Exported ${new Date().toLocaleString()}\n\n`];
    chat.messages.forEach(m => {
      lines.push(`**${m.role === 'user' ? 'You' : 'Compass'}:** ${m.content}\n\n`);
    });
    const blob = new Blob([lines.join('')], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `compass-chat-${chat.id}.md`;
    a.click();
  }

  /* ═══════════════════════════════════════════════════
     RENAME MODAL
  ═══════════════════════════════════════════════════ */
  function openRenameModal(id) {
    renameTargetId = id;
    const c = getChat(id);
    document.getElementById('renameInput').value = c?.title || '';
    document.getElementById('renameModal').classList.add('show');
    setTimeout(() => document.getElementById('renameInput').focus(), 80);
  }

  function closeRenameModal() {
    document.getElementById('renameModal').classList.remove('show');
    renameTargetId = null;
  }

  function saveRename() {
    const val = document.getElementById('renameInput').value.trim();
    if (val && renameTargetId) {
      updateChatTitle(renameTargetId, val);
      if (renameTargetId === activeChatId) {
        document.getElementById('chatTitleDisplay').textContent = val;
      }
      renderHistory();
    }
    closeRenameModal();
  }

  document.getElementById('renameInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveRename();
    if (e.key === 'Escape') closeRenameModal();
  });

  document.getElementById('renameModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeRenameModal();
  });

  /* ═══════════════════════════════════════════════════
     MOBILE SIDEBAR
  ═══════════════════════════════════════════════════ */
  function toggleMobileSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('sidebarOverlay');
    sb.classList.toggle('mobile-open');
    ov.classList.toggle('show');
  }

  function closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebarOverlay').classList.remove('show');
  }

  /* ═══════════════════════════════════════════════════
     UTILS
  ═══════════════════════════════════════════════════ */
  function escHtml(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* Input enable/disable on typing */
  document.getElementById('userInput').addEventListener('input', updateSendBtn);

  /* ═══════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════ */
  renderHistory();