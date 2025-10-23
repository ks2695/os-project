document.addEventListener('DOMContentLoaded', () => {
    const capacityInput = document.getElementById('capacity');
    const pagesInput = document.getElementById('pages');
    const fifoBtn = document.getElementById('fifoBtn');
    const lruBtn = document.getElementById('lruBtn');
    const optimalBtn = document.getElementById('optimalBtn');
    const outputEl = document.getElementById('output');
    const resultTitleEl = document.getElementById('result-title');

    const getInput = () => {
        const capacity = parseInt(capacityInput.value, 10);
        const pages = pagesInput.value.split(',').map(p => parseInt(p.trim(), 10)).filter(p => !isNaN(p));
        return { capacity, pages };
    };

    const displayResult = (title, log) => {
        resultTitleEl.textContent = title;
        outputEl.textContent = log;
    };

    // --- FIFO Algorithm ---
    fifoBtn.addEventListener('click', () => {
        const { capacity, pages } = getInput();
        let frames = Array(capacity).fill(-1);
        let page_faults = 0;
        let victim_pointer = 0;
        let log = "";

        pages.forEach(page => {
            log += `Accessing page ${page}: `;
            if (!frames.includes(page)) {
                page_faults++;
                const replaced = frames[victim_pointer];
                frames[victim_pointer] = page;
                victim_pointer = (victim_pointer + 1) % capacity;
                log += `Page Fault! Frame state: [${frames.join(', ')}] (Replaced ${replaced === -1 ? 'empty frame' : replaced})\n`;
            } else {
                log += `Hit. Frame state: [${frames.join(', ')}]\n`;
            }
        });

        log += `\n✅ Total Page Faults: ${page_faults}`;
        displayResult("FIFO Simulation Results", log);
    });

    // --- LRU Algorithm ---
    lruBtn.addEventListener('click', () => {
        const { capacity, pages } = getInput();
        let frames = [];
        let page_faults = 0;
        let log = "";

        pages.forEach(page => {
            log += `Accessing page ${page}: `;
            const pageIndex = frames.indexOf(page);

            if (pageIndex === -1) { // Page Fault
                page_faults++;
                if (frames.length < capacity) {
                    frames.push(page);
                    log += `Page Fault! Frame state: [${frames.join(', ')}] (Loaded into new frame)\n`;
                } else {
                    const replaced = frames.shift(); // The first element is the least recently used
                    frames.push(page);
                    log += `Page Fault! Frame state: [${frames.join(', ')}] (Replaced ${replaced})\n`;
                }
            } else { // Page Hit
                // Move the accessed page to the end to mark it as most recently used
                frames.splice(pageIndex, 1);
                frames.push(page);
                log += `Hit. Frame state: [${frames.join(', ')}]\n`;
            }
        });

        log += `\n✅ Total Page Faults: ${page_faults}`;
        displayResult("LRU Simulation Results", log);
    });

    // --- Optimal Algorithm ---
    optimalBtn.addEventListener('click', () => {
        const { capacity, pages } = getInput();
        let frames = [];
        let page_faults = 0;
        let log = "";

        pages.forEach((page, currentIndex) => {
            log += `Accessing page ${page}: `;

            if (!frames.includes(page)) { // Page Fault
                page_faults++;
                if (frames.length < capacity) {
                    frames.push(page);
                    log += `Page Fault! Frame state: [${frames.join(', ')}] (Loaded into new frame)\n`;
                } else {
                    const victimIndex = findOptimalVictim(frames, pages, currentIndex);
                    const replaced = frames[victimIndex];
                    frames[victimIndex] = page;
                    log += `Page Fault! Frame state: [${frames.join(', ')}] (Replaced ${replaced})\n`;
                }
            } else { // Page Hit
                log += `Hit. Frame state: [${frames.join(', ')}]\n`;
            }
        });

        log += `\n✅ Total Page Faults: ${page_faults}`;
        displayResult("Optimal Simulation Results", log);
    });

    /**
     * Helper for Optimal algorithm. Finds the frame whose page will be used
     * farthest in the future or not at all.
     */
    const findOptimalVictim = (currentFrames, futurePages, currentIndex) => {
        let victimIndex = -1;
        let farthest = -1;

        currentFrames.forEach((framePage, i) => {
            let found = false;
            // Find the next occurrence of this frame's page
            for (let j = currentIndex + 1; j < futurePages.length; j++) {
                if (futurePages[j] === framePage) {
                    // If this occurrence is farther than the current farthest, update
                    if (j > farthest) {
                        farthest = j;
                        victimIndex = i;
                    }
                    found = true;
                    break;
                }
            }

            // If a page is never used again, it's the perfect victim.
            if (!found) {
                victimIndex = i;
                // We can break early because this is the best possible choice.
                // To do that, we'd need to change the forEach to a standard for loop.
                // For simplicity, we'll let it continue, but mark this as the one to return.
                farthest = Infinity; 
            }
        });

        // If all frames contain pages that will be used again, victimIndex will be set.
        // If no pages are found in the future (farthest remains -1), we can just replace the first frame.
        return (victimIndex === -1) ? 0 : victimIndex;
    };
});
