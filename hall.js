// Hall of Jews - Leaderboard JavaScript

// Featured subjects descriptions (AI-generated analysis)
const featuredDescriptions = [
    {
        id: 1,
        text: "Pronounced aquiline nasal bridge with distinctive Semitic bone structure. High cheekbone placement and deep-set orbital characteristics consistent with Levantine ancestry. Facial proportions show strong markers associated with Eastern European Ashkenazi lineage."
    },
    {
        id: 2,
        text: "Classic Mediterranean-Jewish phenotype with refined nasal cartilage structure. Prominent brow ridge and characteristic periorbital features. Dermal pigmentation and hair texture patterns indicate mixed Ashkenazi-Sephardic genetic markers."
    },
    {
        id: 3,
        text: "Distinctive Semitic facial geometry with pronounced zygomatic arch. Nasal dorsum profile and labial structure consistent with Jewish diaspora populations. Cranial proportions suggest strong Ashkenazi heritage with possible Mizrahi admixture."
    }
];

// Initialize featured descriptions
function initFeaturedDescriptions() {
    featuredDescriptions.forEach(desc => {
        const el = document.getElementById(`analysis-${desc.id}`);
        if (el) {
            el.innerHTML = desc.text;
        }
    });
}

// Get hall entries from localStorage
function getHallEntries() {
    const entries = localStorage.getItem('jewscan_hall');
    return entries ? JSON.parse(entries) : [];
}

// Save hall entries to localStorage
function saveHallEntries(entries) {
    localStorage.setItem('jewscan_hall', JSON.stringify(entries));
}

// Add new entry to hall (called from main scan page)
function addToHall(name, percentage, imageData) {
    const entries = getHallEntries();
    
    const newEntry = {
        id: Date.now(),
        name: name || 'Anonymous',
        percentage: percentage,
        image: imageData,
        date: new Date().toISOString()
    };
    
    entries.push(newEntry);
    
    // Sort by percentage descending
    entries.sort((a, b) => b.percentage - a.percentage);
    
    // Keep only top 50
    if (entries.length > 50) {
        entries.length = 50;
    }
    
    saveHallEntries(entries);
    return newEntry;
}

// Format date
function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Render leaderboard
function renderLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    const emptyState = document.getElementById('emptyState');
    const entries = getHallEntries();
    
    if (entries.length === 0) {
        leaderboard.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    leaderboard.style.display = 'flex';
    emptyState.style.display = 'none';
    
    leaderboard.innerHTML = entries.map((entry, index) => {
        const rank = index + 1;
        const isTop3 = rank <= 3;
        const rankClass = rank <= 3 ? `top-3 rank-${rank}` : '';
        
        return `
            <div class="hall-entry ${rankClass}">
                <div class="hall-rank">${rank}</div>
                <img src="${entry.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23111%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'}" alt="" class="hall-image">
                <div class="hall-info">
                    <div class="hall-name">${entry.name}</div>
                    <div class="hall-date">${formatDate(entry.date)}</div>
                </div>
                <div class="hall-percentage">${entry.percentage}<span>%</span></div>
            </div>
        `;
    }).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initFeaturedDescriptions();
    renderLeaderboard();
});

// Expose addToHall globally for the scan page to use
window.addToHall = addToHall;
