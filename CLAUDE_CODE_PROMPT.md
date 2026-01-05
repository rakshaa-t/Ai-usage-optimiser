# Fix AI Usage Optimizer - Implementation Tasks

## Files to Modify:
- `src/pages/UploadPage.jsx` - Add Max Mode detection and input validation
- `src/pages/DashboardPage.jsx` - Change export from JSON to PDF

## Task 1: Add Max Mode / Extended Thinking Detection

**Location:** `src/pages/UploadPage.jsx`, `analyzeData` function (around line 197)

**Requirements:**
- Parse "Max Mode" or "Extended Thinking" column (case-insensitive)
- Count requests where value is "extended" or "max"
- Calculate extra cost spent on extended thinking
- Add to analysis result: `extendedThinking: { count, cost, percentage }`

**Example output:**
```javascript
{
  extendedThinking: {
    count: 45,
    cost: 23.50,
    percentage: 10.3
  }
}
```

## Task 2: Add Input Validation

**Location:** `src/pages/UploadPage.jsx`, `handleAnalyze` function (around line 156)

**Requirements:**
- Validate file size: reject files > 50MB
- Validate CSV format: check first row has headers
- Validate required columns: must have at least one of ["cost", "model"] (case-insensitive)
- Show user-friendly error messages in existing error state
- Don't crash on invalid files

**Error messages:**
- "File too large (max 50MB)"
- "Invalid CSV format"
- "CSV missing required columns (Cost or Model)"

## Task 3: Change Export to PDF

**Location:** `src/pages/DashboardPage.jsx`, `handleExport` function (around line 83)

**Requirements:**
- Install: `jspdf` and `jspdf-autotable` (or `react-pdf`)
- Generate PDF with:
  - Title: "AI Usage Report"
  - Summary stats (total spent, savings, requests)
  - Model breakdown (text list, not chart)
  - Recommendations list
  - Date generated
- Download as `ai-usage-report-YYYY-MM-DD.pdf`
- Keep same button/UI, just change output format

## Task 4: Fix Weekly Usage Chart

**Location:** `src/components/UsageChart.jsx`

**Issue:** Chart shows dots instead of bars

**Fix:** Ensure bars render correctly with proper height calculations

---

## Constraints:
- Keep existing UI/UX unchanged
- Use minimal dependencies
- Maintain current code structure
- Test with actual Cursor CSV format

