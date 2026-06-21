const UI_GRID_SIZE = 3;
const GOAL_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];

let currentState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
let startState = null;       // captured when AI is triggered
let solutionPath = null;     // full path array
let isAnimating = false;
let userMoves = 0;
let currentAnimStep = 0;

// Direction labels for tracing
const DIRECTION_LABELS = {
    '-3': '↑ Up',
    '3':  '↓ Down',
    '-1': '← Left',
    '1':  '→ Right'
};

function init() {
    renderBoard();
    renderMiniBoard('goal-board', GOAL_STATE, 'goal');
    renderMiniBoard('start-board', currentState, 'start');
    updateStatus('Puzzle ready. Shuffle or play!');
    document.getElementById('shuffle-btn').addEventListener('click', shuffleBoard);
    document.getElementById('solve-btn').addEventListener('click', solveWithAI);
}

// ── MAIN BOARD ──────────────────────────────────────────────

function renderBoard() {
    const wrapper = document.getElementById('board-wrapper');
    wrapper.innerHTML = '';

    currentState.forEach((val, idx) => {
        const tile = document.createElement('div');
        tile.className = `tile ${val === 0 ? 'empty' : ''}`;
        if (val !== 0) {
            tile.innerText = val;
            tile.id = `tile-${val}`;
        }

        const row = Math.floor(idx / UI_GRID_SIZE);
        const col = idx % UI_GRID_SIZE;
        tile.style.transform = `translate(${col * 100 + 5}px, ${row * 100 + 5}px)`;

        if (val !== 0 && val === idx + 1) {
            tile.classList.add('in-place');
        }

        if (!isAnimating && val !== 0) {
            tile.addEventListener('click', () => attemptMove(idx));
        }

        wrapper.appendChild(tile);
    });
}

// ── MINI BOARD (left panel) ──────────────────────────────────

function renderMiniBoard(containerId, state, mode) {
    const wrapper = document.getElementById(containerId);
    wrapper.innerHTML = '';

    // Each mini tile is 52px + ~6px gap, start at 3px padding
    const SIZE = 58; // step size
    const PAD = 3;

    state.forEach((val, idx) => {
        const tile = document.createElement('div');
        tile.className = `mini-tile ${val === 0 ? 'empty' : ''}`;
        if (val !== 0) tile.innerText = val;

        const row = Math.floor(idx / 3);
        const col = idx % 3;
        tile.style.transform = `translate(${col * SIZE + PAD}px, ${row * SIZE + PAD}px)`;

        if (mode === 'goal' && val !== 0 && val === idx + 1) {
            tile.classList.add('in-place');
        }

        if (mode === 'start' && val !== 0) {
            tile.classList.add('highlight');
        }

        wrapper.appendChild(tile);
    });
}

// ── MOVE LOGIC ───────────────────────────────────────────────

function attemptMove(idx) {
    if (isAnimating) return;
    const zeroIdx = currentState.indexOf(0);
    const row = Math.floor(idx / 3), col = idx % 3;
    const zeroRow = Math.floor(zeroIdx / 3), zeroCol = zeroIdx % 3;

    if (Math.abs(row - zeroRow) + Math.abs(col - zeroCol) === 1) {
        [currentState[idx], currentState[zeroIdx]] = [currentState[zeroIdx], currentState[idx]];
        userMoves++;
        updateMovesDisplay();
        renderBoard();
        checkWin();
    }
}

function updateMovesDisplay() {
    document.getElementById('moves-counter').innerText = `Moves: ${userMoves}`;
}

function checkWin() {
    if (currentState.join(',') === GOAL_STATE.join(',')) {
        updateStatus('✦ Solved! Puzzle complete!');
        document.getElementById('status').style.color = '#2ecc71';
        return true;
    }
    return false;
}

// ── SHUFFLE ──────────────────────────────────────────────────

function shuffleBoard() {
    if (isAnimating) return;
    document.getElementById('status').style.color = 'var(--text-muted)';
    updateStatus('Shuffling...');

    let zeroIdx = currentState.indexOf(0);
    for (let i = 0; i < 200; i++) {
        const neighbors = [];
        const r = Math.floor(zeroIdx / 3), c = zeroIdx % 3;
        if (r > 0) neighbors.push(zeroIdx - 3);
        if (r < 2) neighbors.push(zeroIdx + 3);
        if (c > 0) neighbors.push(zeroIdx - 1);
        if (c < 2) neighbors.push(zeroIdx + 1);

        const rn = neighbors[Math.floor(Math.random() * neighbors.length)];
        [currentState[zeroIdx], currentState[rn]] = [currentState[rn], currentState[zeroIdx]];
        zeroIdx = rn;
    }

    userMoves = 0;
    updateMovesDisplay();
    renderBoard();
    clearTrace();
    renderMiniBoard('start-board', currentState, 'start');
    document.getElementById('start-info').innerText = 'Ready';
    updateStatus('Shuffled! Press Solve or play manually.');
}

// ── AI SOLVE ─────────────────────────────────────────────────

async function solveWithAI() {
    if (isAnimating) return;
    if (checkWin()) { updateStatus('Already solved!'); return; }

    isAnimating = true;
    document.getElementById('solve-btn').disabled = true;
    document.getElementById('shuffle-btn').disabled = true;
    document.getElementById('status').style.color = 'var(--accent)';
    updateStatus('⟳ AI is thinking...');

    // Capture start state
    startState = [...currentState];
    renderMiniBoard('start-board', startState, 'start');
    document.getElementById('start-info').innerText = startState.join(' ');

    // Render goal board
    renderMiniBoard('goal-board', GOAL_STATE, 'goal');

    setTimeout(async () => {
        try {
            solutionPath = window.Solve8Puzzle(currentState);

            if (!solutionPath) {
                updateStatus('No solution found.');
                isAnimating = false;
                resetButtons();
                return;
            }

            const totalMoves = solutionPath.length - 1;
            document.getElementById('stat-total').innerText = totalMoves;

            // Build step list
            buildStepList(solutionPath);

            updateStatus(`Solution: ${totalMoves} moves. Animating...`);

            // Animate each step
            for (let i = 0; i < solutionPath.length; i++) {
                currentState = solutionPath[i];
                renderBoard();
                highlightStep(i);

                document.getElementById('stat-current').innerText = i;

                if (i < solutionPath.length - 1) {
                    await new Promise(r => setTimeout(r, 450));
                }
            }

            checkWin();

        } catch (e) {
            console.error(e);
            updateStatus('Error: out of memory.');
        } finally {
            isAnimating = false;
            resetButtons();
        }
    }, 60);
}

// ── STEP TRACE ───────────────────────────────────────────────

function getMoveDirection(fromState, toState) {
    const z1 = fromState.indexOf(0);
    const z2 = toState.indexOf(0);
    const diff = z2 - z1;
    return DIRECTION_LABELS[String(diff)] || '?';
}

function buildStepList(path) {
    const list = document.getElementById('steps-list');
    list.innerHTML = '';

    path.forEach((state, i) => {
        const item = document.createElement('div');
        item.className = 'step-item';
        item.id = `step-${i}`;

        const numEl = document.createElement('span');
        numEl.className = 'step-num';
        numEl.innerText = i === 0 ? 'S' : i;

        const arrowEl = document.createElement('span');
        arrowEl.className = 'step-arrow';

        if (i === 0) {
            arrowEl.innerText = '◈';
        } else if (i === path.length - 1) {
            arrowEl.innerText = '✦';
        } else {
            arrowEl.innerText = getMoveDirection(path[i - 1], state);
        }

        const stateEl = document.createElement('span');
        stateEl.className = 'step-state';
        // Show as 3-3-3 formatted state
        const s = state.map(v => v === 0 ? '_' : v).join('');
        stateEl.innerText = `${s.slice(0,3)} ${s.slice(3,6)} ${s.slice(6,9)}`;

        item.appendChild(numEl);
        item.appendChild(arrowEl);
        item.appendChild(stateEl);
        list.appendChild(item);
    });
}

function highlightStep(idx) {
    const path = solutionPath;
    if (!path) return;

    // Mark all previous as done, current as active
    for (let i = 0; i < path.length; i++) {
        const el = document.getElementById(`step-${i}`);
        if (!el) continue;
        el.classList.remove('active', 'done');
        if (i < idx) el.classList.add('done');
        else if (i === idx) {
            el.classList.add('active');
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

function clearTrace() {
    solutionPath = null;
    document.getElementById('steps-list').innerHTML =
        '<div class="steps-placeholder">Run AI to see step-by-step trace</div>';
    document.getElementById('stat-total').innerText = '—';
    document.getElementById('stat-current').innerText = '—';
}

// ── UTILS ────────────────────────────────────────────────────

function resetButtons() {
    document.getElementById('solve-btn').disabled = false;
    document.getElementById('shuffle-btn').disabled = false;
}

function updateStatus(msg) {
    document.getElementById('status').innerText = msg;
}

window.onload = init;
