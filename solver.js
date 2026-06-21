// MinHeap for A* to keep the node with smallest total cost (f = g + h)
class MinHeap {
    constructor() {
        this.heap = [];
    }
    push(node) {
        this.heap.push(node);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0) return null;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = bottom;
            this.sinkDown(0);
        }
        return top;
    }
    bubbleUp(idx) {
        const node = this.heap[idx];
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            const parent = this.heap[parentIdx];
            if (node.priority >= parent.priority) break;
            this.heap[idx] = parent;
            this.heap[parentIdx] = node;
            idx = parentIdx;
        }
    }
    sinkDown(idx) {
        const length = this.heap.length;
        const node = this.heap[idx];
        while (true) {
            let leftChildIdx = 2 * idx + 1;
            let rightChildIdx = 2 * idx + 2;
            let leftChild, rightChild;
            let swap = null;

            if (leftChildIdx < length) {
                leftChild = this.heap[leftChildIdx];
                if (leftChild.priority < node.priority) {
                    swap = leftChildIdx;
                }
            }
            if (rightChildIdx < length) {
                rightChild = this.heap[rightChildIdx];
                if ((swap === null && rightChild.priority < node.priority) || 
                    (swap !== null && rightChild.priority < leftChild.priority)) {
                    swap = rightChildIdx;
                }
            }
            if (swap === null) break;
            this.heap[idx] = this.heap[swap];
            this.heap[swap] = node;
            idx = swap;
        }
    }
    isEmpty() {
        return this.heap.length === 0;
    }
}

const goal_state = [1, 2, 3, 4, 5, 6, 7, 8, 0];
const moves = {
    "up": -3,
    "down": 3,
    "left": -1,
    "right": 1
};

// Manhattan distance heuristic
function heuristic(state) {
    let distance = 0;
    for (let i = 0; i < 9; i++) {
        if (state[i] !== 0) {
            let goal_index = goal_state.indexOf(state[i]);
            let x1 = Math.floor(i / 3), y1 = i % 3;
            let x2 = Math.floor(goal_index / 3), y2 = goal_index % 3;
            distance += Math.abs(x1 - x2) + Math.abs(y1 - y2);
        }
    }
    return distance;
}

function get_neighbors(state) {
    let neighbors = [];
    let zero_index = state.indexOf(0);

    for (let pos of Object.values(moves)) {
        let new_index = zero_index + pos;

        // Move constraints
        if (pos === -1 && zero_index % 3 === 0) continue; // left
        if (pos === 1 && zero_index % 3 === 2) continue;  // right
        if (pos === -3 && zero_index < 3) continue;       // up
        if (pos === 3 && zero_index > 5) continue;        // down

        let new_state = [...state];
        // Swap
        [new_state[zero_index], new_state[new_index]] = [new_state[new_index], new_state[zero_index]];
        neighbors.push(new_state);
    }

    return neighbors;
}

// Convert state array to a string or number for faster set lookup
function stateToStr(state) {
    return state.join('');
}

function solve(start) {
    const startStr = stateToStr(start);
    const goalStr = stateToStr(goal_state);
    
    if (startStr === goalStr) return [start];

    let pq = new MinHeap();
    // Element layout: { state, g, path, priority }
    pq.push({ 
        state: start, 
        g: 0, 
        path: [start],
        priority: heuristic(start) + 0 
    });
    
    let visited = new Set();

    while (!pq.isEmpty()) {
        let current = pq.pop();
        let { state, g, path } = current;
        
        let sStr = stateToStr(state);

        if (visited.has(sStr)) continue;
        visited.add(sStr);

        if (sStr === goalStr) {
            return path;
        }

        const neighbors = get_neighbors(state);
        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i];
            const nStr = stateToStr(neighbor);
            if (!visited.has(nStr)) {
                let h = heuristic(neighbor);
                pq.push({ 
                    state: neighbor, 
                    g: g + 1, 
                    path: [...path, neighbor], 
                    priority: g + 1 + h 
                });
            }
        }
    }
    return null;
}

// Attach to window so script.js can call it
window.Solve8Puzzle = solve;
