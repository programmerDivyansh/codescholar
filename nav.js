// common navigation script
// handles opening/closing the full-screen nav panel

function initNav() {
    const nav = document.getElementById('site-nav');
    const openBtn = document.getElementById('open');
    const closeBtn = document.getElementById('close');
    if (!nav || !openBtn || !closeBtn) return;

    openBtn.addEventListener('click', () => {
        nav.classList.add('open');
        document.body.classList.add('nav-open');
        openBtn.style.display = 'none';
    });

    closeBtn.addEventListener('click', () => {
        nav.classList.remove('open');
        document.body.classList.remove('nav-open');
        openBtn.style.display = '';
    });
}

document.addEventListener('DOMContentLoaded', initNav);

// add a personal AI chat button + in-page panel (30% width) on every page
function initPersonalChat() {
    // avoid duplicate
    if (document.getElementById('personal-chat-btn')) return;

    // button
    const btn = document.createElement('button');
    btn.id = 'personal-chat-btn';
    btn.textContent = 'your personal ai chat bot';
    btn.title = 'Open personal AI chat bot';
    Object.assign(btn.style, {
        position: 'fixed',
        zIndex: 99999,
        padding: '10px 14px',
        background: '#007acc',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        // we'll set left/top after insertion so the button is draggable
        left: '0px',
        top: '0px'
    });

    // panel
    const panel = document.createElement('div');
    panel.id = 'personal-chat-panel';
    Object.assign(panel.style, {
        position: 'fixed',
        top: '0',
        right: '0',
        height: '100vh',
        width: '0',
        maxWidth: '40vw',
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
        zIndex: 99998,
        transition: 'width 240ms ease'
    });

    // inner toolbar with close button
    const toolbar = document.createElement('div');
    Object.assign(toolbar.style, {
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        background: '#f6f6f6',
        borderBottom: '1px solid #e6e6e6'
    });
    const title = document.createElement('div');
    title.textContent = 'HyperBot';
    title.style.fontWeight = '600';
    const close = document.createElement('button');
    close.textContent = '✕';
    Object.assign(close.style, { background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' });
    toolbar.appendChild(title);
    toolbar.appendChild(close);

    // iframe container
    const iframe = document.createElement('iframe');
    iframe.src = 'chatbot.html';
    iframe.style.width = '100%';
    iframe.style.height = 'calc(100vh - 44px)';
    iframe.style.border = '0';

    panel.appendChild(toolbar);
    panel.appendChild(iframe);

    document.body.appendChild(panel);
    document.body.appendChild(btn);

    let open = false;
    // initialize position (restore from sessionStorage or default bottom-right)
    requestAnimationFrame(() => {
        try {
            const saved = sessionStorage.getItem('personalChatBtnPos');
            if (saved) {
                const pos = JSON.parse(saved);
                btn.style.left = (typeof pos.left === 'number' ? pos.left : 20) + 'px';
                btn.style.top = (typeof pos.top === 'number' ? pos.top : 20) + 'px';
            } else {
                // default to bottom-right with margins: 20px right, 80px bottom
                const defaultRight = 20;
                const defaultBottom = 80;
                const left = Math.max(8, window.innerWidth - btn.offsetWidth - defaultRight);
                const top = Math.max(8, window.innerHeight - btn.offsetHeight - defaultBottom);
                btn.style.left = left + 'px';
                btn.style.top = top + 'px';
            }
        } catch (err) {
            // ignore storage errors
        }
    });
    function openPanel() {
        // set to 30% of viewport width but not exceeding maxWidth
        const target = Math.min(window.innerWidth * 0.30, window.innerWidth * 0.40) + 'px';
        panel.style.width = target;
        open = true;
        btn.style.display = 'none';
    }
    function closePanel() {
        panel.style.width = '0';
        open = false;
        btn.style.display = '';
    }

    // Make the button draggable (mouse + touch)
    let dragging = false;
    let startX = 0, startY = 0, origX = 0, origY = 0, moved = false;

    function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

    function startDrag(e) {
        e.preventDefault();
        dragging = true;
        moved = false;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX;
        startY = clientY;
        origX = parseInt(btn.style.left, 10) || 0;
        origY = parseInt(btn.style.top, 10) || 0;
        btn.style.transition = 'none';
    }

    function onDrag(e) {
        if (!dragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - startX;
        const dy = clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
        let newLeft = origX + dx;
        let newTop = origY + dy;
        newLeft = clamp(newLeft, 4, window.innerWidth - btn.offsetWidth - 4);
        newTop = clamp(newTop, 4, window.innerHeight - btn.offsetHeight - 4);
        btn.style.left = newLeft + 'px';
        btn.style.top = newTop + 'px';
    }

    function endDrag() {
        if (!dragging) return;
        dragging = false;
        btn.style.transition = '';
        try {
            sessionStorage.setItem('personalChatBtnPos', JSON.stringify({ left: parseInt(btn.style.left, 10), top: parseInt(btn.style.top, 10) }));
        } catch (err) {}
    }

    btn.addEventListener('mousedown', startDrag, { passive: false });
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    btn.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', endDrag);

    // open only when it was a click (not a drag)
    btn.addEventListener('click', (e) => {
        if (moved) { moved = false; e.stopImmediatePropagation(); return; }
        openPanel();
    });
    close.addEventListener('click', closePanel);

    // close when user clicks outside the panel
    document.addEventListener('click', (e) => {
        if (!open) return;
        if (!panel.contains(e.target) && e.target !== btn) {
            closePanel();
        }
    });
}

document.addEventListener('DOMContentLoaded', initPersonalChat);