// Data storage
let representatives = [];
let politiciansByState = {};

// Load data
async function loadData() {
    try {
        const response = await fetch('congress-data.json');
        representatives = await response.json();
        updateStats();
        console.log(`Loaded ${representatives.length} representatives`);
    } catch (error) {
        console.error('Error loading data:', error);
        representatives = [];
    }
}

// Load politicians by state data
async function loadPoliticiansByState() {
    try {
        const response = await fetch('politicians-by-state.json');
        politiciansByState = await response.json();
        console.log(`Loaded politicians for ${Object.keys(politiciansByState).length} states`);
    } catch (error) {
        console.error('Error loading politicians by state:', error);
        politiciansByState = {};
    }
}

// Update stats
function updateStats() {
    const totalCount = representatives.length;
    const totalFunding = representatives.reduce((sum, rep) => sum + rep.amount, 0);
    
    const entityCountEl = document.getElementById('entityCount');
    const fundingTotalEl = document.getElementById('fundingTotal');
    
    if (entityCountEl) entityCountEl.textContent = totalCount.toLocaleString();
    if (fundingTotalEl) fundingTotalEl.textContent = formatCurrency(totalFunding);
}

// Format currency
function formatCurrency(amount) {
    if (amount >= 1000000000) {
        return '$' + (amount / 1000000000).toFixed(1) + 'B';
    } else if (amount >= 1000000) {
        return '$' + (amount / 1000000).toFixed(0) + 'M';
    } else if (amount >= 1000) {
        return '$' + (amount / 1000).toFixed(0) + 'K';
    }
    return '$' + amount.toLocaleString();
}

// Get initials
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// Get party badge class
function getPartyClass(party) {
    if (party === 'D') return 'democrat';
    if (party === 'R') return 'republican';
    return 'independent';
}

// Get party full name
function getPartyName(party) {
    if (party === 'D') return 'Democrat';
    if (party === 'R') return 'Republican';
    return 'Independent';
}

// Render database grid
function renderDatabase(filtered = null) {
    const grid = document.getElementById('databaseGrid');
    const contentArea = document.getElementById('contentArea');
    const data = filtered || representatives;
    
    // Sort by amount descending
    const sorted = [...data].sort((a, b) => b.amount - a.amount);
    
    if (sorted.length === 0) {
        grid.innerHTML = '<p style="color: var(--gray-500); grid-column: 1/-1; text-align: center; padding: 2rem;">No representatives found</p>';
        grid.classList.add('active');
        contentArea.style.display = 'none';
        return;
    }
    
    grid.innerHTML = sorted.map(rep => `
        <div class="entity-card" data-id="${rep.id}">
            <div class="entity-header">
                <div class="entity-avatar">${getInitials(rep.name)}</div>
                <div class="entity-info">
                    <div class="entity-name">${rep.name}</div>
                    <div class="entity-meta">
                        <span class="party-badge ${getPartyClass(rep.party)}">${rep.party}</span>
                        <span>${rep.state || 'N/A'}</span>
                    </div>
                </div>
            </div>
            <div class="entity-amount">${formatCurrency(rep.amount)}</div>
            <div class="entity-years">${rep.yearsActive || '1990-2024'}</div>
        </div>
    `).join('');
    
    grid.classList.add('active');
    contentArea.style.display = 'none';
    
    // Add click handlers
    grid.querySelectorAll('.entity-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            showDetail(id);
        });
    });
}

// Show detail modal
function showDetail(id) {
    const rep = representatives.find(r => r.id === id);
    if (!rep) return;
    
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h2 class="modal-title">${rep.name}</h2>
        <div class="modal-info">
            <div class="modal-info-item">
                <div class="modal-info-label">Party</div>
                <div class="modal-info-value">
                    <span class="party-badge ${getPartyClass(rep.party)}">${rep.party}</span>
                    ${getPartyName(rep.party)}
                </div>
            </div>
            <div class="modal-info-item">
                <div class="modal-info-label">State</div>
                <div class="modal-info-value">${rep.state || 'N/A'}</div>
            </div>
            <div class="modal-info-item">
                <div class="modal-info-label">Total Funding</div>
                <div class="modal-amount">${formatCurrency(rep.amount)}</div>
                <div style="font-size: 0.875rem; color: var(--gray-500);">Exact: $${rep.amount.toLocaleString()}</div>
            </div>
            <div class="modal-info-item">
                <div class="modal-info-label">Years Active</div>
                <div class="modal-info-value">${rep.yearsActive || '1990-2024'}</div>
            </div>
            <div class="modal-info-item">
                <div class="modal-info-label">Organizations</div>
                <div class="modal-info-value" style="font-size: 0.875rem; line-height: 1.6;">${rep.pacs}</div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Close modal
document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('detailModal').classList.remove('active');
});

document.querySelector('.modal-overlay').addEventListener('click', () => {
    document.getElementById('detailModal').classList.remove('active');
});

// Category tabs (if they exist)
const tabBtns = document.querySelectorAll('.tab-btn');
if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            
            if (category === 'all') {
                renderDatabase();
            } else if (category === 'democrats') {
                const filtered = representatives.filter(r => r.party === 'D');
                renderDatabase(filtered);
            } else if (category === 'republicans') {
                const filtered = representatives.filter(r => r.party === 'R');
                renderDatabase(filtered);
            } else if (category === 'senate') {
                const filtered = representatives.filter(r => r.district === 'SEN' || r.name.includes('Senator'));
                renderDatabase(filtered);
            } else if (category === 'historical') {
                renderDatabase();
            }
        });
    });
}

// State name mapping
const stateNames = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

// Create tooltip element
const tooltip = document.createElement('div');
tooltip.id = 'stateTooltip';
tooltip.style.cssText = `
    position: fixed;
    background: rgba(0,0,0,0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    pointer-events: none;
    z-index: 1000;
    display: none;
    border: 1px solid #333;
`;
document.body.appendChild(tooltip);

// Side Panel Functions
function openStatePanel(stateName) {
    const politicians = politiciansByState[stateName] || [];
    const panel = document.getElementById('statePanel');
    const overlay = document.getElementById('panelOverlay');
    
    // Set title
    document.getElementById('panelTitle').textContent = stateName;
    
    // Calculate stats
    const totalAmount = politicians.reduce((sum, p) => sum + p.amount, 0);
    document.getElementById('panelStats').innerHTML = `
        <span>${politicians.length} politicians</span>
        <span class="amount">$${totalAmount.toLocaleString()} total</span>
    `;
    
    // Render politicians
    renderPanelList(politicians);
    
    // Show panel
    panel.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Setup search
    const searchInput = document.getElementById('panelSearch');
    searchInput.value = '';
    searchInput.focus();
}

function closeStatePanel() {
    document.getElementById('statePanel').classList.remove('active');
    document.getElementById('panelOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function renderPanelList(politicians, searchTerm = '') {
    const list = document.getElementById('panelList');
    
    let filtered = politicians;
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = politicians.filter(p => p.name.toLowerCase().includes(term));
    }
    
    // Sort by amount
    filtered.sort((a, b) => b.amount - a.amount);
    
    if (filtered.length === 0) {
        list.innerHTML = '<div class="panel-empty">No politicians found</div>';
        return;
    }
    
    list.innerHTML = filtered.map(p => {
        const partyClass = p.party === 'D' ? 'dem' : p.party === 'R' ? 'rep' : 'ind';
        const partyName = p.party === 'D' ? 'DEM' : p.party === 'R' ? 'REP' : 'IND';
        const initials = p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        
        return `
            <div class="politician-item" data-id="${p.id}">
                <div class="politician-avatar ${partyClass}">${initials}</div>
                <div class="politician-info">
                    <div class="politician-name">${p.name}</div>
                    <div class="politician-meta">
                        <span class="politician-party ${partyClass}">${partyName}</span>
                        <span>${p.stateCode}</span>
                    </div>
                </div>
                <div class="politician-amount">$${p.amount.toLocaleString()}</div>
            </div>
        `;
    }).join('');
}

// Panel event listeners
document.getElementById('panelClose').addEventListener('click', closeStatePanel);
document.getElementById('panelOverlay').addEventListener('click', closeStatePanel);

document.getElementById('panelSearch').addEventListener('input', (e) => {
    const stateName = document.getElementById('panelTitle').textContent;
    const politicians = politiciansByState[stateName] || [];
    renderPanelList(politicians, e.target.value);
});

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeStatePanel();
    }
});

// Map interaction handler
const mapObject = document.getElementById('usaMap');
if (mapObject) {
    mapObject.addEventListener('load', function() {
        const svgDoc = mapObject.contentDocument;
        if (!svgDoc) return;
        
        const states = svgDoc.querySelectorAll('.state');
        
        states.forEach(state => {
            const stateId = state.id;
            const stateName = stateNames[stateId] || stateId;
            
            // Hover effects - calculate values dynamically at hover time
            state.addEventListener('mouseenter', (e) => {
                const politicians = politiciansByState[stateName] || [];
                const stateFunding = politicians.reduce((sum, p) => sum + p.amount, 0);
                const repCount = politicians.length;
                tooltip.innerHTML = `<strong>${stateName}</strong><br>${repCount} politicians • $${stateFunding.toLocaleString()}`;
                tooltip.style.display = 'block';
            });
            
            state.addEventListener('mousemove', (e) => {
                tooltip.style.left = (e.clientX + 15) + 'px';
                tooltip.style.top = (e.clientY + 15) + 'px';
            });
            
            state.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
            
            // Click to open side panel
            state.addEventListener('click', () => {
                openStatePanel(stateName);
            });
        });
    });
}

// Initialize
loadData();
loadPoliticiansByState();
