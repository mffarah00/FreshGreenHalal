/**
 * Fresh & Green Halal Market — Floating Chatbot Widget
 * Drop this script tag into any HTML page to add the chatbot:
 *   <script src="chatbot_widget.js"></script>
 *
 * Requires: chatbot.php on the same server
 */

(function () {
    // ── INJECT STYLES ───────────────────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

    /* FAB BUTTON */
    .hm-fab {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 62px;
      height: 62px;
      border-radius: 50%;
      background: linear-gradient(145deg, #1b4332 0%, #0a1f14 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 32px rgba(27,67,50,0.5), 0 2px 8px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99998;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
    }
    .hm-fab:hover {
      transform: scale(1.12);
      box-shadow: 0 12px 40px rgba(27,67,50,0.6);
    }
    .hm-fab svg { width: 28px; height: 28px; fill: #fff; }
    .hm-fab .hm-fab-chef { font-size: 26px; line-height: 1; }

    /* PULSE RING */
    .hm-fab-pulse {
      position: absolute;
      width: 62px;
      height: 62px;
      border-radius: 50%;
      background: rgba(212,160,23,0.5);
      animation: hm-pulse 2s ease-out infinite;
      pointer-events: none;
    }
    @keyframes hm-pulse {
      0% { transform: scale(1); opacity: 0.7; }
      100% { transform: scale(2); opacity: 0; }
    }

    /* NOTIFICATION DOT */
    .hm-fab-dot {
      position: absolute;
      top: 4px; right: 4px;
      width: 13px; height: 13px;
      background: #d4a017;
      border: 2px solid #fff;
      border-radius: 50%;
      display: none;
      animation: hm-blink 1.5s ease-in-out infinite;
    }
    @keyframes hm-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* CHAT WINDOW */
    .hm-chat {
      position: fixed;
      bottom: 104px;
      right: 28px;
      width: 380px;
      max-width: calc(100vw - 40px);
      max-height: 560px;
      background: #fff;
      border-radius: 24px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(27,67,50,0.08);
      display: none;
      flex-direction: column;
      z-index: 99997;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', 'Roboto', Arial, sans-serif;
    }
    .hm-chat.open {
      display: flex;
      animation: hm-pop 0.32s cubic-bezier(0.34,1.56,0.64,1) forwards;
    }
    @keyframes hm-pop {
      from { transform: scale(0.6) translateY(20px); opacity: 0; }
      to   { transform: scale(1) translateY(0); opacity: 1; }
    }

    /* HEADER */
    .hm-header {
      background: linear-gradient(135deg, #1b4332 0%, #0a1f14 100%);
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .hm-header-avatar {
      width: 42px; height: 42px;
      background: rgba(255,255,255,0.15);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
      border: 2px solid rgba(255,255,255,0.25);
    }
    .hm-header-info { flex: 1; }
    .hm-header-info strong {
      display: block;
      color: #fff;
      font-size: 0.95rem;
      font-weight: 700;
    }
    .hm-header-status {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
    }
    .hm-status-dot {
      width: 7px; height: 7px;
      background: #69f0ae;
      border-radius: 50%;
      animation: hm-blink 2s ease-in-out infinite;
    }
    .hm-header-status span {
      color: rgba(255,255,255,0.7);
      font-size: 0.73rem;
    }
    .hm-close {
      background: rgba(255,255,255,0.15);
      border: none;
      color: #fff;
      width: 30px; height: 30px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .hm-close:hover { background: rgba(255,255,255,0.28); }

    /* EXPANDED MODE */
    .hm-chat.expanded {
      width: min(720px, calc(100vw - 40px));
      max-height: calc(100vh - 120px);
      bottom: 104px;
      right: 28px;
    }
    .hm-expand {
      background: rgba(255,255,255,0.15);
      border: none;
      color: #fff;
      width: 30px; height: 30px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
      flex-shrink: 0;
      margin-right: 4px;
    }
    .hm-expand:hover { background: rgba(255,255,255,0.28); }
    .hm-expand svg { width: 14px; height: 14px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; }

    /* MESSAGES */
    .hm-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #fafafa;
    }
    .hm-messages::-webkit-scrollbar { width: 4px; }
    .hm-messages::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }

    .hm-bubble {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 0.88rem;
      line-height: 1.55;
      word-break: break-word;
    }
    .hm-bubble.bot {
      background: #fff;
      color: #222;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    }
    .hm-bubble.user {
      background: linear-gradient(135deg, #1b4332, #0a1f14);
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .hm-bubble a {
      color: #1b4332;
      font-weight: 600;
      text-decoration: underline;
    }
    .hm-bubble.user a { color: #ffcdd2; }

    /* RECIPE CARDS IN CHAT */
    .hm-recipe-cards {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 6px;
      align-self: flex-start;
      width: 100%;
      max-width: 310px;
    }
    .hm-recipe-card {
      background: #fff;
      border: 1.5px solid #ffcdd2;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      text-decoration: none;
      color: #222;
      transition: box-shadow 0.2s, border-color 0.2s;
      box-shadow: 0 1px 5px rgba(0,0,0,0.05);
    }
    .hm-recipe-card:hover {
      border-color: #1b4332;
      box-shadow: 0 3px 12px rgba(27,67,50,0.12);
    }
    .hm-recipe-card img {
      width: 46px; height: 46px;
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .hm-recipe-card-body strong {
      display: block;
      font-size: 0.8rem;
      font-weight: 700;
      color: #222;
      line-height: 1.3;
    }
    .hm-recipe-card-body span {
      font-size: 0.72rem;
      color: #1b4332;
      font-weight: 600;
    }

    /* TYPING INDICATOR */
    .hm-typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
      background: #fff;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    }
    .hm-typing span {
      width: 7px; height: 7px;
      background: #ccc;
      border-radius: 50%;
      animation: hm-bounce 1.2s ease-in-out infinite;
    }
    .hm-typing span:nth-child(2) { animation-delay: 0.2s; }
    .hm-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes hm-bounce {
      0%, 60%, 100% { transform: translateY(0); background: #ccc; }
      30% { transform: translateY(-6px); background: #d4a017; }
    }

    /* CHIPS */
    .hm-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 10px 14px 4px;
      background: #fafafa;
      flex-shrink: 0;
    }
    .hm-chip {
      background: #fff;
      border: 1.5px solid #1b4332;
      color: #1b4332;
      font-size: 0.78rem;
      font-weight: 600;
      border-radius: 20px;
      padding: 5px 12px;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s, color 0.15s;
    }
    .hm-chip:hover {
      background: #d4a017;
      color: #fff;
    }

    /* INPUT AREA */
    .hm-input-area {
      padding: 12px 14px;
      display: flex;
      gap: 8px;
      align-items: flex-end;
      background: #fff;
      border-top: 1px solid #f0f0f0;
      flex-shrink: 0;
    }
    .hm-input {
      flex: 1;
      border: 1.5px solid #e0e0e0;
      border-radius: 14px;
      padding: 9px 13px;
      font-size: 0.88rem;
      font-family: inherit;
      resize: none;
      outline: none;
      max-height: 80px;
      overflow-y: auto;
      transition: border-color 0.2s;
      background: #fafafa;
      line-height: 1.4;
    }
    .hm-input:focus { border-color: #1b4332; background: #fff; }
    .hm-send {
      width: 38px; height: 38px;
      background: linear-gradient(135deg, #1b4332, #0a1f14);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 3px 10px rgba(212,160,23,0.5);
    }
    .hm-send:hover { transform: scale(1.1); box-shadow: 0 5px 16px rgba(212,160,23,0.6); }
    .hm-send svg { width: 16px; height: 16px; fill: #fff; }

    /* DIVIDER */
    .hm-divider {
      font-size: 0.7rem;
      color: #bbb;
      text-align: center;
      padding: 2px 0;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    @media (max-width: 480px) {
      .hm-chat { bottom: 0; right: 0; width: 100vw; max-width: 100vw; border-radius: 24px 24px 0 0; }
      .hm-fab { bottom: 18px; right: 16px; }
    }
  `;
    document.head.appendChild(style);

    // ── BUILD HTML ──────────────────────────────────────────────────────────────
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
    <!-- FAB -->
    <button class="hm-fab" id="hm-fab" aria-label="Open cooking assistant">
      <div class="hm-fab-pulse"></div>
      <span class="hm-fab-chef">👨‍🍳</span>
      <span class="hm-fab-dot" id="hm-dot"></span>
    </button>

    <!-- CHAT WINDOW -->
    <div class="hm-chat" id="hm-chat" role="dialog" aria-label="Halal cooking assistant">
      <div class="hm-header">
        <div class="hm-header-avatar">👨‍🍳</div>
        <div class="hm-header-info">
          <strong>Halal Cooking Assistant</strong>
          <div class="hm-header-status">
            <div class="hm-status-dot"></div>
            <span>Powered by AI + Edamam Recipes</span>
          </div>
        </div>
        <button class="hm-expand" id="hm-expand" aria-label="Expand chat" title="Expand">
          <svg viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
        </button>
        <button class="hm-close" id="hm-close" aria-label="Close chat">✕</button>
      </div>

      <div class="hm-messages" id="hm-messages">
        <div class="hm-bubble bot">
          Assalamu Alaikum! 👋 I'm your halal cooking assistant.<br><br>
          Ask me about recipes, and I'll check which ingredients we have <strong>in stock at Fresh & Green</strong> — and suggest dishes that use them!
        </div>
      </div>

      <div class="hm-chips" id="hm-chips">
        <button class="hm-chip" data-msg="What can I make with ground lamb?">Ground lamb ideas 🥩</button>
        <button class="hm-chip" data-msg="Quick halal chicken recipe">Quick chicken 🍗</button>
        <button class="hm-chip" data-msg="What halal spices should I keep at home?">Essential spices 🌿</button>
        <button class="hm-chip" data-msg="Suggest a recipe using items in your store">Use store items 🛒</button>
      </div>

      <div class="hm-input-area">
        <textarea class="hm-input" id="hm-input" placeholder="Ask about halal cooking…" rows="1"></textarea>
        <button class="hm-send" id="hm-send" aria-label="Send message">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
    document.body.appendChild(wrapper);

    // ── LOGIC ───────────────────────────────────────────────────────────────────
    const fab      = document.getElementById('hm-fab');
    const chat     = document.getElementById('hm-chat');
    const messages = document.getElementById('hm-messages');
    const input    = document.getElementById('hm-input');
    const sendBtn  = document.getElementById('hm-send');
    const closeBtn = document.getElementById('hm-close');
    const chips    = document.getElementById('hm-chips');
    const dot      = document.getElementById('hm-dot');

    const expandBtn = document.getElementById('hm-expand');
    let isOpen     = false;
    let isExpanded = false;

    const expandIcon   = '<svg viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
    const collapseIcon = '<svg viewBox="0 0 24 24"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>';

    expandBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        chat.classList.toggle('expanded', isExpanded);
        expandBtn.innerHTML = isExpanded ? collapseIcon : expandIcon;
        expandBtn.title = isExpanded ? 'Collapse' : 'Expand';
        scrollBottom();
    });

    // Show notification dot after 3 seconds
    setTimeout(() => { if (!isOpen) dot.style.display = 'block'; }, 3000);

    function toggleChat() {
        isOpen = !isOpen;
        chat.classList.toggle('open', isOpen);
        dot.style.display = 'none';
        if (isOpen) {
            setTimeout(() => input.focus(), 150);
        } else {
            // Reset expand state on close
            isExpanded = false;
            chat.classList.remove('expanded');
            expandBtn.innerHTML = expandIcon;
            expandBtn.title = 'Expand';
        }
    }

    fab.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    function scrollBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    function addBubble(html, role) {
        const div = document.createElement('div');
        div.className = 'hm-bubble ' + role;
        div.innerHTML = html;
        messages.appendChild(div);
        scrollBottom();
        return div;
    }

    function addDivider(text) {
        const div = document.createElement('div');
        div.className = 'hm-divider';
        div.textContent = text;
        messages.appendChild(div);
        scrollBottom();
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'hm-typing';
        div.id = 'hm-typing';
        div.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(div);
        scrollBottom();
    }

    function removeTyping() {
        const el = document.getElementById('hm-typing');
        if (el) el.remove();
    }

    function addRecipeCards(recipes) {
        if (!recipes || !recipes.length) return;
        const container = document.createElement('div');
        container.className = 'hm-recipe-cards';

        addDivider('📖 Matching Recipes');

        recipes.forEach(r => {
            const a = document.createElement('a');
            a.className = 'hm-recipe-card';
            a.href = r.url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.innerHTML = `
        <img src="${r.image}" alt="${r.title}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2246%22 height=%2246%22><rect width=%2246%22 height=%2246%22 fill=%22%23ffcdd2%22/><text x=%2250%25%22 y=%2255%25%22 text-anchor=%22middle%22 fill=%22%23d32f2f%22 font-size=%2220%22>🍽</text></svg>'">
        <div class="hm-recipe-card-body">
          <strong>${r.title}</strong>
          <span>~${r.calories} kcal · View full recipe →</span>
        </div>
      `;
            container.appendChild(a);
        });

        messages.appendChild(container);
        scrollBottom();
    }

    async function sendMessage(text) {
        text = text.trim();
        if (!text) return;

        // Determine chatbot.php path (same folder as current page)
        const chatbotUrl = window.HM_CHATBOT_URL || 'chatbot.php';

        addBubble(text, 'user');
        input.value = '';
        input.style.height = 'auto';
        chips.style.display = 'none';
        showTyping();

        try {
            const res = await fetch(chatbotUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();
            removeTyping();

            // Format reply: convert newlines to <br>, bold **text**
            let reply = data.reply || 'Sorry, I couldn\'t get a response!';
            reply = reply
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');

            addBubble(reply, 'bot');

            if (data.hasRecipes && data.recipes && data.recipes.length) {
                addRecipeCards(data.recipes);
            }
        } catch (err) {
            removeTyping();
            addBubble('Error: ' + err.message, 'bot');
        }
    }

    // Chip buttons
    chips.querySelectorAll('.hm-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            sendMessage(chip.dataset.msg);
        });
    });

    sendBtn.addEventListener('click', () => sendMessage(input.value));

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input.value);
        }
    });

    input.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });

})();