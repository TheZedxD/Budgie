# Troubleshooting Guide

This guide helps resolve common issues when running Budgie.

---

## CORS / Module Loading Errors

### Problem
You see one of these errors in the browser console:

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at file:///...
```

```
Module source URI is not allowed in this document: "file:///..."
```

### Cause
You're trying to open `index.html` directly in your browser (using `file://` protocol). ES6 modules require HTTP/HTTPS protocol for security reasons, so browsers block module loading from local files.

### Solution
**You MUST run a local web server.** Choose one of these methods:

#### Quick Start (Easiest)

**Linux/Mac:**
```bash
# Double-click or run in terminal
./START-SERVER.sh
```

**Windows:**
```batch
REM Double-click or run in Command Prompt
START-SERVER.bat
```

#### Manual Methods

**Python (Recommended - Usually Pre-installed)**
```bash
# Navigate to Budgie directory
cd /path/to/Budgie

# Python 3 (most common)
python3 -m http.server 8000

# OR Python 2
python -m SimpleHTTPServer 8000

# Open: http://localhost:8000
```

**Node.js**
```bash
# Install once
npm install -g http-server

# Run from Budgie directory
http-server -p 8000

# Open: http://localhost:8000
```

**PHP**
```bash
# Navigate to Budgie directory
php -S localhost:8000

# Open: http://localhost:8000
```

**VS Code**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## Page Loads But Shows No Data

### Problem
The page loads but the calendar is empty and no balance shows.

### Solutions

1. **First Time Setup**
   - Click "Settings" in the header
   - Enter your starting balance
   - Select an effective date (usually today)
   - Click "Save Settings"

2. **Check LocalStorage**
   - Open browser DevTools (F12)
   - Go to "Application" or "Storage" tab
   - Check "Local Storage" for your domain
   - Look for keys like `budgetTransactions`, `startingBalance`

3. **Clear Browser Cache**
   - Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
   - Clear "Cached images and files"
   - Refresh the page (Ctrl+R or F5)

4. **Try Incognito/Private Mode**
   - Open the app in incognito/private window
   - Rules out extension conflicts

---

## Theme Not Persisting

### Problem
Theme (light/dark) resets every time you reload.

### Cause
LocalStorage is disabled or blocked.

### Solutions

1. **Check Browser Settings**
   - Ensure cookies/site data are allowed
   - Check if "Block third-party cookies" is affecting localStorage

2. **Check Incognito Mode**
   - Some browsers block localStorage in incognito mode
   - Use normal browser window

3. **Check Browser Extensions**
   - Disable privacy extensions temporarily
   - Some extensions block localStorage

---

## Charts Not Rendering

### Problem
Reports modal opens but charts don't appear.

### Solutions

1. **Add Transactions First**
   - Charts need data to display
   - Add at least one transaction
   - Set a starting balance

2. **Canvas Support**
   - Ensure your browser supports Canvas 2D
   - Update to a modern browser version
   - Recommended: Chrome 90+, Firefox 88+, Safari 14+

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Report any errors you find

---

## Performance Issues

### Problem
App is slow or laggy with many transactions.

### Solutions

1. **Clear Old Data**
   - Export your data first (JSON backup)
   - Click "Clear All Data" in side panel
   - Import only recent transactions

2. **Browser Performance**
   - Close unnecessary browser tabs
   - Disable resource-heavy extensions
   - Clear browser cache

3. **Expected Performance**
   - 100 transactions: Instant
   - 1,000 transactions: <100ms rendering
   - 10,000 transactions: ~200ms rendering
   - If slower, check browser console for errors

---

## Calendar Navigation Issues

### Problem
Can't navigate months or click on days.

### Solutions

1. **JavaScript Errors**
   - Open browser console (F12)
   - Look for red error messages
   - Refresh the page

2. **Event Listeners**
   - Ensure page fully loaded
   - Try hard refresh: Ctrl+Shift+R

3. **Browser Compatibility**
   - Update to a supported browser
   - Minimum versions:
     - Chrome 90+
     - Firefox 88+
     - Safari 14+
     - Edge 90+

---

## Data Export/Import Issues

### Problem
Export button doesn't work or import fails.

### Solutions

1. **Export Not Working**
   - Check browser console for errors
   - Ensure you have transactions to export
   - Try a different browser

2. **Import Fails**
   - Ensure JSON file is valid (not corrupted)
   - Check file was exported from Budgie
   - Look for validation errors in console

3. **File Format**
   - Only JSON files are supported
   - File must have correct structure
   - Exported files include all necessary fields

---

## Undo/Redo Not Working

### Problem
Ctrl+Z or undo button doesn't restore changes.

### Solutions

1. **History Limit**
   - Undo history limited to 50 steps
   - Older changes are lost
   - This is by design to save memory

2. **State Snapshot**
   - Some operations don't create snapshots
   - Most major actions (add/edit/delete) do

3. **Page Reload**
   - Undo/redo history is lost on page reload
   - This is by design (not persisted)

---

## Mobile/Responsive Issues

### Problem
App doesn't work well on mobile or small screens.

### Cause
Budgie is optimized for desktop and tablet (768px+).

### Solutions

1. **Use Desktop/Tablet**
   - Best experience on screens 768px or wider
   - Use desktop computer or tablet in landscape

2. **Mobile Browser**
   - Some features may be hard to use
   - Scrolling and zooming can help
   - Consider desktop for main usage

---

## Browser-Specific Issues

### Chrome/Edge
- **Problem**: LocalStorage quota exceeded
- **Solution**: Clear old data, export important transactions

### Firefox
- **Problem**: Canvas rendering slower than Chrome
- **Solution**: Update to latest Firefox version

### Safari
- **Problem**: Some ES6 features may not work in older versions
- **Solution**: Update to Safari 14+ or use Chrome/Firefox

### Internet Explorer
- **Not Supported**: IE does not support ES6 modules
- **Solution**: Use a modern browser (Chrome, Firefox, Edge, Safari)

---

## Data Loss Prevention

### Best Practices

1. **Regular Exports**
   - Export data weekly/monthly
   - Keep backup JSON files
   - Store in safe location (cloud, external drive)

2. **Browser Data**
   - Don't clear browser data without exporting first
   - Understand localStorage limitations
   - Consider using bookmarks to remember server port

3. **Testing Changes**
   - Test major changes with small dataset first
   - Use undo feature immediately if mistake made
   - Keep recent export before clearing data

---

## Getting Help

If none of these solutions work:

1. **Check Browser Console**
   - Open DevTools (F12)
   - Go to "Console" tab
   - Copy any error messages

2. **Try Different Browser**
   - Test in Chrome, Firefox, or Edge
   - Helps identify browser-specific issues

3. **Report Issue**
   - Include browser version
   - Include console error messages
   - Describe steps to reproduce
   - Note: No sensitive data is shared (everything is local)

---

## Common Error Messages

### "localStorage is not defined"
- **Cause**: LocalStorage disabled or unavailable
- **Solution**: Enable cookies/site data in browser settings

### "Cannot read property 'length' of undefined"
- **Cause**: Data structure corruption
- **Solution**: Clear localStorage and start fresh (export first!)

### "Uncaught SyntaxError: Cannot use import statement outside a module"
- **Cause**: Not using a web server (file:// protocol)
- **Solution**: Use one of the local server methods above

### "QuotaExceededError: Failed to execute 'setItem' on 'Storage'"
- **Cause**: LocalStorage quota exceeded (usually 5-10MB)
- **Solution**: Export data, clear all, import only recent transactions

---

## Prevention Tips

1. **Always Use a Web Server**
   - Never open `index.html` directly
   - Use the provided startup scripts
   - Bookmark `http://localhost:8000`

2. **Regular Maintenance**
   - Export data monthly
   - Clear old transactions yearly
   - Keep browser updated

3. **Understand Limitations**
   - LocalStorage has size limits
   - No multi-device sync
   - Data is browser-specific

---

## Still Having Issues?

Document your problem with:
- Browser name and version
- Operating system
- Steps to reproduce
- Console error messages (F12 → Console tab)
- Screenshots if helpful

The more detail you provide, the easier it is to help!
