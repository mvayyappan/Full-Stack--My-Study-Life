// Notes API functions
async function getNotes() {
  const token = window.MS_AUTH.getToken();
  if (!token) return { success: false, data: [] };
  try {
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/notes/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) return { success: false, data: [] };
    const data = await res.json();
    return { success: true, data: data };
  } catch (err) {
    console.error('Error fetching notes:', err);
    return { success: false, data: [] };
  }
}

async function createNote(title, description, color = '#ffffff') {
  const token = window.MS_AUTH.getToken();
  if (!token) {
    alert('Please login first');
    return { success: false, data: null };
  }
  try {
    const payload = { title: title, description: description, color: color };
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/notes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error creating note:', errorData.detail || 'Unknown error');
      return { success: false, data: null };
    }
    const data = await res.json();
    return { success: true, data: data };
  } catch (err) {
    console.error('Error creating note:', err);
    return { success: false, data: null };
  }
}

async function updateNote(noteId, title, description, color) {
  const token = window.MS_AUTH.getToken();
  if (!token) return { success: false };
  try {
    const payload = { title, description, color };
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    console.error('Error updating note:', err);
    return { success: false };
  }
}

async function toggleStar(noteId) {
  const token = window.MS_AUTH.getToken();
  if (!token) return { success: false };
  try {
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/notes/${noteId}/star`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    console.error('Error toggling star:', err);
    return { success: false };
  }
}

async function deleteNote(noteId) {
  const token = window.MS_AUTH.getToken();
  if (!token) return { success: false };
  try {
    const res = await fetch(`${window.MS_CONFIG.baseUrl}/api/notes/${noteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { success: res.ok };
  } catch (err) {
    console.error('Error deleting note:', err);
    return { success: false };
  }
}

async function loadNotes() {
  const res = await getNotes();
  if (!res.success) {
    console.error('Failed to load notes');
    return [];
  }
  return res.data;
}

// Notes page handler variables
let allNotes = []; 
let currentlyEditingId = null;

// Handle create note
async function handleCreateNote(title, description, color) {
  if (!title.trim()) {
    alert('Please enter a note title');
    return;
  }
  const res = await createNote(title, description, color);
  if (res.success) {
    console.log('Note created:', res.data);
    return res.data;
  } else {
    alert('Failed to create note');
  }
}

// Filter and sort notes
function filterAndSortNotes() {
  const searchTerm = document.getElementById('search-notes')?.value.toLowerCase() || '';
  const sortBy = document.getElementById('sort-filter')?.value || 'newest';

  let filtered = allNotes.filter(n =>
    n.title.toLowerCase().includes(searchTerm) ||
    (n.description && n.description.toLowerCase().includes(searchTerm))
  );

  if (sortBy === 'newest') {
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy === 'oldest') {
    filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (sortBy === 'starred') {
    filtered = filtered.filter(n => n.is_starred);
  } else if (sortBy === 'az') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  return filtered;
}

// Render notes to grid
function renderNotesToGrid(notesList) {
  const grid = document.getElementById('notes-grid');
  if (!grid) return;
  grid.innerHTML = notesList.map(note => {
    const date = new Date(note.created_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    return `
    <div class="note-card" data-id="${note.id}" style="background-color: ${note.color || '#fff7b1'};">
      <div class="card-left-accent"></div>
      <div class="card-content">
        <div class="card-actions">
          <span class="starred-btn"><i class="${note.is_starred ? 'fa-solid' : 'fa-regular'} fa-star"></i></span>
          <span class="edit-btn"><i class="fa-solid fa-pen"></i></span>
          <span class="delete-btn"><i class="fa-solid fa-trash"></i></span>
        </div>
        <h3>${note.title}</h3>
        <p class="note-text">${note.description || ''}</p>
        <span class="note-date">${date}</span>
      </div>
    </div>
  `;
  }).join('');
}

// Load and render notes
async function loadAndRenderNotes() {
  const res = await getNotes();
  if (res.success) {
    allNotes = res.data;
    renderNotesToGrid(filterAndSortNotes());
  }
}

// Attach event handlers for notes page
function attachNotesPageHandlers() {
  const saveBtn = document.getElementById('save-note-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const title = document.getElementById('note-title-input').value;
      const description = document.getElementById('note-description-input').value;
      const color = document.getElementById('note-color-picker').value;
      const note = await handleCreateNote(title, description, color);
      if (note) {
        document.getElementById('note-title-input').value = '';
        document.getElementById('note-description-input').value = '';
        loadAndRenderNotes();
      }
    });
  }

  const searchInput = document.getElementById('search-notes');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderNotesToGrid(filterAndSortNotes());
    });
  }

  const sortFilter = document.getElementById('sort-filter');
  if (sortFilter) {
    sortFilter.addEventListener('change', () => {
      renderNotesToGrid(filterAndSortNotes());
    });
  }

  const updateBtn = document.querySelector('.btn-update');
  if (updateBtn) {
    updateBtn.addEventListener('click', async () => {
      if (!currentlyEditingId) return;
      const title = document.getElementById('modal-note-title').value;
      const description = document.getElementById('modal-note-content').value;
      const color = document.getElementById('modal-note-color').value;

      const res = await updateNote(currentlyEditingId, title, description, color);
      if (res.success) {
        document.getElementById('update-modal').style.display = 'none';
        loadAndRenderNotes();
      } else {
        alert('Failed to update note');
      }
    });
  }

  const closeBtns = document.querySelectorAll('.close-modal');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('update-modal').style.display = 'none';
    });
  });

  const grid = document.getElementById('notes-grid');
  if (grid) {
    grid.addEventListener('click', async (e) => {
      const card = e.target.closest('.note-card');
      if (!card) return;
      const noteId = card.dataset.id;

      if (e.target.closest('.delete-btn')) {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this note?')) {
          const res = await deleteNote(noteId);
          if (res.success) loadAndRenderNotes();
        }
      } else if (e.target.closest('.edit-btn')) {
        e.stopPropagation();
        currentlyEditingId = noteId;
        const note = allNotes.find(n => n.id == noteId);
        if (note) {
          document.getElementById('modal-note-title').value = note.title;
          document.getElementById('modal-note-content').value = note.description;
          document.getElementById('modal-note-color').value = note.color || '#fff7b1';
          document.getElementById('update-modal').style.display = 'flex';
        }
      } else if (e.target.closest('.starred-btn')) {
        e.stopPropagation();
        const res = await toggleStar(noteId);
        if (res.success) loadAndRenderNotes();
      } else {
        const note = allNotes.find(n => n.id == noteId);
        if (note) {
          document.getElementById('view-note-title').innerText = note.title;
          document.getElementById('view-note-description').innerText = note.description || '';
          document.getElementById('view-note-color').style.backgroundColor = note.color || '#fff7b1';
          document.getElementById('note-view-modal').classList.add('active');
        }
      }
    });
  }
}

// Global function for close view
window.closeNoteView = function () {
  const modal = document.getElementById('note-view-modal');
  if (modal) modal.classList.remove('active');
}

// Export notes functions
window.MS_NOTES = {
  getNotes,
  createNote,
  updateNote,
  toggleStar,
  deleteNote,
  loadNotes,
  handleCreateNote,
  filterAndSortNotes,
  renderNotesToGrid,
  loadAndRenderNotes,
  attachNotesPageHandlers
};
