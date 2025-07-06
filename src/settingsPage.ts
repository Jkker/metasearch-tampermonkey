/**
 * Settings Page Module
 * 
 * Provides a user interface for managing search engine configuration.
 * Allows users to view, add, edit, remove, and reorder search engines.
 */

import { loadConfiguration, saveConfiguration, resetConfiguration } from './configManager'
import type { Engine } from './types'

/**
 * Opens the settings page in a new window/tab.
 */
export function openSettingsPage(): void {
  const settingsWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
  
  if (!settingsWindow) {
    alert('Failed to open settings window. Please allow popups for this site.')
    return
  }

  const config = loadConfiguration()
  
  settingsWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>MetaSearch Settings</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
          padding: 20px;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .engine-list {
          margin-bottom: 30px;
        }
        
        .engine-item {
          display: flex;
          align-items: center;
          padding: 15px;
          margin-bottom: 10px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          gap: 15px;
        }
        
        .engine-item:hover {
          background: #e9ecef;
        }
        
        .engine-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }
        
        .engine-info {
          flex: 1;
        }
        
        .engine-title {
          font-weight: 600;
          color: #2c3e50;
        }
        
        .engine-url {
          font-size: 0.9em;
          color: #6c757d;
          margin-top: 2px;
        }
        
        .engine-actions {
          display: flex;
          gap: 10px;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background: #007bff;
          color: white;
        }
        
        .btn-primary:hover {
          background: #0056b3;
        }
        
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        
        .btn-danger:hover {
          background: #c82333;
        }
        
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #5a6268;
        }
        
        .btn-success {
          background: #28a745;
          color: white;
        }
        
        .btn-success:hover {
          background: #218838;
        }
        
        .btn-warning {
          background: #ffc107;
          color: #212529;
        }
        
        .btn-warning:hover {
          background: #e0a800;
        }
        
        .main-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 30px;
        }
        
        .move-buttons {
          display: flex;
          gap: 5px;
        }
        
        .disabled {
          opacity: 0.6;
        }
        
        .disabled-label {
          color: #dc3545;
          font-weight: 500;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        input, textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }
        
        textarea {
          resize: vertical;
          min-height: 80px;
        }
        
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .checkbox-group input {
          width: auto;
        }
        
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          margin: 50px auto;
          padding: 30px;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .close {
          font-size: 24px;
          cursor: pointer;
          color: #6c757d;
        }
        
        .close:hover {
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>MetaSearch Settings</h1>
        
        <div class="engine-list" id="engineList">
          <!-- Engine items will be populated here -->
        </div>
        
        <div class="main-actions">
          <button class="btn btn-primary" onclick="showAddEngineModal()">Add New Engine</button>
          <button class="btn btn-success" onclick="saveSettings()">Save Settings</button>
          <button class="btn btn-warning" onclick="resetSettings()">Reset to Default</button>
          <button class="btn btn-secondary" onclick="window.close()">Close</button>
        </div>
      </div>
      
      <!-- Add/Edit Engine Modal -->
      <div id="engineModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modalTitle">Add New Engine</h3>
            <span class="close" onclick="closeModal()">&times;</span>
          </div>
          <div class="form-group">
            <label for="engineTitle">Title:</label>
            <input type="text" id="engineTitle" placeholder="Search Engine Name">
          </div>
          <div class="form-group">
            <label for="engineUrl">URL Template:</label>
            <input type="text" id="engineUrl" placeholder="https://example.com/search?q=%s">
          </div>
          <div class="form-group">
            <label for="engineHex">Color (hex):</label>
            <input type="text" id="engineHex" placeholder="#007bff">
          </div>
          <div class="form-group">
            <label for="engineSvg">SVG Icon:</label>
            <textarea id="engineSvg" placeholder="<svg>...</svg>"></textarea>
          </div>
          <div class="form-group">
            <label for="engineSlug">Slug (optional):</label>
            <input type="text" id="engineSlug" placeholder="unique-identifier">
          </div>
          <div class="form-group">
            <label for="engineQ">Query Parameter (optional):</label>
            <input type="text" id="engineQ" placeholder="q">
          </div>
          <div class="form-group">
            <div class="checkbox-group">
              <input type="checkbox" id="engineDisabled">
              <label for="engineDisabled">Disabled</label>
            </div>
          </div>
          <div class="main-actions">
            <button class="btn btn-primary" onclick="saveEngine()">Save Engine</button>
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          </div>
        </div>
      </div>
    </body>
    </html>
  `)
  
  // Add JavaScript functionality
  settingsWindow.document.write(`
    <script>
      let engines = ${JSON.stringify(config.engines)};
      let editingIndex = -1;
      
      function renderEngineList() {
        const list = document.getElementById('engineList');
        list.innerHTML = '';
        
        engines.forEach((engine, index) => {
          const item = document.createElement('div');
          item.className = 'engine-item' + (engine.disabled ? ' disabled' : '');
          item.innerHTML = \`
            <div class="engine-icon">\${engine.svg}</div>
            <div class="engine-info">
              <div class="engine-title">
                \${engine.title}
                \${engine.disabled ? '<span class="disabled-label">(Disabled)</span>' : ''}
              </div>
              <div class="engine-url">\${engine.url}</div>
            </div>
            <div class="engine-actions">
              <div class="move-buttons">
                <button class="btn btn-secondary" onclick="moveEngine(\${index}, -1)" \${index === 0 ? 'disabled' : ''}>↑</button>
                <button class="btn btn-secondary" onclick="moveEngine(\${index}, 1)" \${index === engines.length - 1 ? 'disabled' : ''}>↓</button>
              </div>
              <button class="btn btn-primary" onclick="editEngine(\${index})">Edit</button>
              <button class="btn btn-danger" onclick="deleteEngine(\${index})">Delete</button>
            </div>
          \`;
          list.appendChild(item);
        });
      }
      
      function showAddEngineModal() {
        editingIndex = -1;
        document.getElementById('modalTitle').textContent = 'Add New Engine';
        clearForm();
        document.getElementById('engineModal').style.display = 'block';
      }
      
      function editEngine(index) {
        editingIndex = index;
        const engine = engines[index];
        document.getElementById('modalTitle').textContent = 'Edit Engine';
        document.getElementById('engineTitle').value = engine.title;
        document.getElementById('engineUrl').value = engine.url;
        document.getElementById('engineHex').value = engine.hex;
        document.getElementById('engineSvg').value = engine.svg;
        document.getElementById('engineSlug').value = engine.slug || '';
        document.getElementById('engineQ').value = engine.q || '';
        document.getElementById('engineDisabled').checked = engine.disabled || false;
        document.getElementById('engineModal').style.display = 'block';
      }
      
      function closeModal() {
        document.getElementById('engineModal').style.display = 'none';
      }
      
      function clearForm() {
        document.getElementById('engineTitle').value = '';
        document.getElementById('engineUrl').value = '';
        document.getElementById('engineHex').value = '';
        document.getElementById('engineSvg').value = '';
        document.getElementById('engineSlug').value = '';
        document.getElementById('engineQ').value = '';
        document.getElementById('engineDisabled').checked = false;
      }
      
      function saveEngine() {
        const title = document.getElementById('engineTitle').value.trim();
        const url = document.getElementById('engineUrl').value.trim();
        const hex = document.getElementById('engineHex').value.trim();
        const svg = document.getElementById('engineSvg').value.trim();
        const slug = document.getElementById('engineSlug').value.trim();
        const q = document.getElementById('engineQ').value.trim();
        const disabled = document.getElementById('engineDisabled').checked;
        
        if (!title || !url || !hex || !svg) {
          alert('Please fill in all required fields (Title, URL, Color, SVG)');
          return;
        }
        
        if (!hex.startsWith('#')) {
          alert('Color must start with #');
          return;
        }
        
        if (!url.includes('%s')) {
          alert('URL template must contain %s placeholder');
          return;
        }
        
        const engine = {
          title,
          url,
          hex,
          svg,
          ...(slug && { slug }),
          ...(q && { q }),
          ...(disabled && { disabled })
        };
        
        if (editingIndex === -1) {
          engines.push(engine);
        } else {
          engines[editingIndex] = engine;
        }
        
        renderEngineList();
        closeModal();
      }
      
      function deleteEngine(index) {
        if (confirm('Are you sure you want to delete this engine?')) {
          engines.splice(index, 1);
          renderEngineList();
        }
      }
      
      function moveEngine(index, direction) {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < engines.length) {
          const temp = engines[index];
          engines[index] = engines[newIndex];
          engines[newIndex] = temp;
          renderEngineList();
        }
      }
      
      function saveSettings() {
        try {
          // Send configuration back to parent window
          window.opener.postMessage({
            type: 'saveConfiguration',
            engines: engines
          }, '*');
          alert('Settings saved successfully!');
        } catch (error) {
          alert('Failed to save settings: ' + error.message);
        }
      }
      
      function resetSettings() {
        if (confirm('Are you sure you want to reset to default settings? This will remove all your customizations.')) {
          window.opener.postMessage({
            type: 'resetConfiguration'
          }, '*');
          alert('Settings reset to default!');
          window.close();
        }
      }
      
      // Initial render
      renderEngineList();
      
      // Close modal when clicking outside
      window.onclick = function(event) {
        const modal = document.getElementById('engineModal');
        if (event.target === modal) {
          closeModal();
        }
      }
    </script>
  `)
  
  settingsWindow.document.close()
}