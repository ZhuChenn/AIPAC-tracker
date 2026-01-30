# AIPACScan Database

## Complete Pro-Israel Funding Database (1990-2024)

This database contains **1,474 US Representatives** and their funding from Pro-Israel organizations from 1990 to 2024.

### 📊 Data Source
- **CSV File**: `Money from Pro-Israel to US Representatives, 1990-2024.csv`
- **JSON Database**: `congress-data.json` (parsed from CSV)
- **Total Representatives**: 1,474
- **Time Period**: 1990-2024 (34 years of data)

### 🏛️ Top Funded Representatives

1. **Wesley Bell** (D-MO) - $2,744,534
2. **George Latimer** (D-NY) - $2,538,736
3. **Robert Menendez** (I-NJ) - $2,507,647
4. **Mark Kirk** (R-IL) - $2,294,469
5. **Josh Gottheimer** (D-NJ) - $2,001,636
6. **Steny H Hoyer** (D-MD) - $1,820,994
7. **Hakeem Jeffries** (D-NY) - $1,741,230
8. **Charles E Schumer** (D-NY) - $1,727,974

### 📁 Database Structure

Each representative entry contains:
```json
{
  "id": 1,
  "name": "Wesley Bell",
  "type": "politician",
  "state": "MO",
  "district": "N/A",
  "party": "D",
  "amount": 2744534,
  "pacs": "Pro-Israel Organizations (1990-2024)",
  "photo": null,
  "yearsActive": "1990-2024"
}
```

### 🎯 Features

#### Interactive Database
- **Search**: Find representatives by name, state, or party
- **Filter**: View by Democrats, Republicans, Independents, or Senate
- **Sort**: Automatically sorted by funding amount (highest to lowest)
- **Details**: Click any representative for detailed information

#### Interactive Map
- **Hover**: See state funding totals
- **Click**: Filter database by state
- **Visual**: Color-coded by funding levels

#### Detailed Views
Each representative's detail page shows:
- Full name and party affiliation
- State representation
- Exact funding amount (formatted and precise)
- Years active (1990-2024)
- Pro-Israel organizations involved

### 🔍 Search & Filter Capabilities

1. **By Name**: Type any representative's name
2. **By State**: Click state on map or search by state abbreviation
3. **By Party**:
   - Democrats (D) - Blue badge
   - Republicans (R) - Red badge
   - Independents (I) - Purple badge
4. **By Category**:
   - All Congress
   - Democrats Only
   - Republicans Only
   - Senate Only

### 💾 Data Storage

- **Primary**: Loaded from `congress-data.json`
- **Cache**: Stored in browser localStorage
- **Fallback**: Top 8 representatives hardcoded if JSON fails
- **Updates**: Real-time stats and animations

### 📈 Statistics

The homepage displays:
- **Total Representatives Tracked**: 1,474
- **Total AIPAC Funding**: $XXX Million (calculated from all entries)
- **Animated Counters**: Numbers animate on page load

### 🎨 Design Features

- **Dark Theme**: Black background with red accents
- **Manrope Font**: Clean, modern typography
- **Responsive**: Works on all screen sizes
- **Smooth Animations**: Hover effects and transitions
- **Party Color Coding**: Visual distinction by political affiliation

### 🚀 Technical Implementation

**Loading Process**:
1. Check localStorage for cached data
2. If not cached, fetch from `congress-data.json`
3. Parse and display 1,474 representatives
4. Save to localStorage for faster future loads
5. Update stats and render database

**Performance**:
- Async loading for non-blocking UI
- Efficient filtering and sorting
- Cached results for instant repeat views
- Lazy rendering for smooth scrolling

### 📝 Data Accuracy

All data sourced from the original CSV:
`Money from Pro-Israel to US Representatives, 1990-2024.csv`

Parsed automatically with Python script ensuring:
- Correct name extraction
- Party identification (D/R/I)
- State abbreviation mapping
- Exact funding amounts
- 34 years of comprehensive data

---

**Last Updated**: January 2026
**Total Database Size**: 1,474 representatives
**Data Range**: 1990-2024
