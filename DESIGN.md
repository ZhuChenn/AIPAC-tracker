# AIPACScan - SomaliScan Design Recreation

## ✅ Complete Recreation

I've recreated the **SomaliScan design** from scratch with your AIPAC data!

### 🎨 Design Features

**Visual Style:**
- ✅ Black background (#000000)
- ✅ Gray color palette (matching SomaliScan exactly)
- ✅ Inter font (similar to Geist)
- ✅ Clean, minimal aesthetic
- ✅ Subtle borders and hover effects
- ✅ Monospace font for stats

**Layout:**
- ✅ Fixed header with logo and navigation
- ✅ Hero stats section (Representatives tracked / Total funding)
- ✅ Updates section with email signup
- ✅ Category tabs for filtering
- ✅ Map/content area
- ✅ Database grid with cards
- ✅ Footer with disclaimer and links
- ✅ Mobile bottom navigation

### 🚀 Features

**Data Display:**
- All 1,474 representatives from CSV
- Sorted by funding amount (highest to lowest)
- Real-time stats calculation
- Party badges (Blue=Democrat, Red=Republican, Gray=Independent)

**Filtering:**
- **All Representatives** - Show everyone
- **Democrats** - Filter by party (D)
- **Republicans** - Filter by party (R)
- **Senate** - Senate members
- **Historical** - Full 1990-2024 dataset

**Interactions:**
- Click any representative card → Opens detailed modal
- Modal shows: Name, Party, State, Total Funding, Years Active, Organizations
- Click map → Shows all representatives
- Mobile responsive with bottom navigation

**Detail Modal:**
- Representative name
- Party affiliation with badge
- State
- Total funding (formatted + exact amount)
- Years active (1990-2024)
- Pro-Israel organizations list

### 📱 Responsive Design

**Desktop (1024px+):**
- Full navigation bar
- Search button with ⌘K shortcut
- Side-by-side layout
- Grid view for database

**Tablet (768px-1023px):**
- Condensed navigation
- Stacked layout
- Adjusted grid columns

**Mobile (<768px):**
- Hamburger menu
- Bottom navigation bar
- Single column layout
- Touch-optimized

### 🎯 How to Use

1. **Homepage:**
   - See total representatives (1,474)
   - See total funding
   - View USA map

2. **Browse:**
   - Click any category tab to filter
   - Database grid appears automatically
   - Cards sorted by funding amount

3. **Details:**
   - Click any representative card
   - Modal opens with full details
   - Close with X or click outside

4. **Search:**
   - Press ⌘K or click Search button
   - (Ready for future implementation)

### 📊 Data Structure

Each representative card shows:
```
┌─────────────────────────┐
│ [JD]  John Doe         │ ← Avatar & Name
│       D • NY           │ ← Party & State
│                         │
│ $2.5M                  │ ← Funding Amount
│ 1990-2024              │ ← Years Active
└─────────────────────────┘
```

### 🎨 Color Palette

```css
Black:        #000000  (Background)
Gray 900:     #171717  (Cards, borders)
Gray 800:     #262626  (Hover states)
Gray 700:     #404040  (Input borders)
Gray 600:     #525252  (Tree lines)
Gray 500:     #737373  (Secondary text)
Gray 400:     #a3a3a3  (Links)
White:        #ffffff  (Primary text)
Blue:         #3b82f6  (Democrat, active)
Red:          #ef4444  (Republican, amounts)
```

### 📁 Files

- `index.html` - Clean HTML structure
- `styles.css` - Complete SomaliScan styling
- `script.js` - Data loading and interactions
- `congress-data.json` - Full 1,474 representative database
- `usa-map.svg` - Your custom USA map

### 🌐 Open in Browser

```bash
cd /Users/jeremiahxeno/Projects/AIPAC
python3 -m http.server 8000
```

Then visit: `http://localhost:8000`

### ✨ Key Differences from Original

**Changed:**
- Title: "SomaliScan" → "AIPACScan"
- Stats: Government spending → AIPAC funding
- Categories: Childcare/PPP/etc → Democrats/Republicans/Senate
- Data: Somali entities → US Representatives

**Kept:**
- Exact same design aesthetic
- Same layout structure
- Same color palette
- Same interaction patterns
- Same responsive behavior

---

**Your AIPACScan now has the professional, clean SomaliScan design!** 🎯
