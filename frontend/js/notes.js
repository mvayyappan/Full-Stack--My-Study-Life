function makeLinksClickable(text) {
  if (!text) return text;
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" style="color:#0091ff;text-decoration:underline;cursor:pointer;"><i class="fa-solid fa-link"></i>${url}</a>`;
  });
}

async function getNotes() {
  const result = await window.API_HELPER.apiGet('/api/notes/', true);
  if (!result.success) {
    console.error('Error fetching notes:', result.error);
    return { success: false, data: [] };
  }
  return { success: true, data: result.data };
}

async function createNote(title, description, color = '#ffffff') {
  const payload = { title: title, description: description, color: color };
  const result = await window.API_HELPER.apiPost('/api/notes/', payload, true);
  if (!result.success) {
    console.error('Error creating note:', result.error);
    return { success: false, data: null };
  }
  return { success: true, data: result.data };
}

async function updateNote(noteId, title, description, color) {
  const payload = { title, description, color };
  const result = await window.API_HELPER.apiPut(`/api/notes/${noteId}`, payload, true);
  return { success: result.success, data: result.data };
}

async function toggleStar(noteId) {
  const result = await window.API_HELPER.apiCall('PATCH', `/api/notes/${noteId}/star`, null, true);
  return { success: result.success, data: result.data };
}

async function deleteNote(noteId) {
  const result = await window.API_HELPER.apiDelete(`/api/notes/${noteId}`, true);
  return { success: result.success };
}

async function loadNotes() {
  const res = await getNotes();
  if (!res.success) {
    console.error('Failed to load notes');
    return [];
  }
  return res.data;
}

let allNotes = [];
let currentlyEditingId = null;

async function handleCreateNote(title, description, color) {
  if (!title.trim()) {
    alert('Please enter a note title');
    return;
  }

  const res = await createNote(title, description, color);
  if (res.success) {
    console.log('Note created:', res.data);
    return res.data;
  }

  alert('Failed to create note');
}

function filterAndSortNotes() {
  const searchTerm = document.getElementById('search-notes')?.value.toLowerCase() || '';
  const sortBy = document.getElementById('sort-filter')?.value || 'newest';

  let filtered = allNotes.filter((n) =>
    n.title.toLowerCase().includes(searchTerm) ||
    (n.description && n.description.toLowerCase().includes(searchTerm))
  );

  if (sortBy === 'newest') {
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy === 'oldest') {
    filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (sortBy === 'starred') {
    filtered = filtered.filter((n) => n.is_starred);
  } else if (sortBy === 'az') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  return filtered;
}

function renderNotesToGrid(notesList) {
  const grid = document.getElementById('notes-grid');
  if (!grid) return;

  grid.innerHTML = notesList
    .map((note) => {
      const date = new Date(note.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const descriptionWithLinks = makeLinksClickable(note.description || '');

      return `
        <div class="note-card" data-id="${note.id}" style="background-color:${note.color || '#fff7b1'};">
          <div class="card-left-accent"></div>
          <div class="card-content">
            <div class="card-actions">
              <span class="starred-btn">
                <i class="${note.is_starred ? 'fa-solid' : 'fa-regular'} fa-star"></i>
              </span>
              <span class="edit-btn"><i class="fa-solid fa-pen"></i></span>
              <span class="delete-btn"><i class="fa-solid fa-trash"></i></span>
            </div>
            <h3>${note.title}</h3>
            <p class="note-text">${descriptionWithLinks}</p>
            <span class="note-date">${date}</span>
          </div>
        </div>`;
    })
    .join('');
}

async function loadAndRenderNotes() {
  const res = await getNotes();
  if (res.success) {
    allNotes = res.data;
    renderNotesToGrid(filterAndSortNotes());
  }
}

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
  closeBtns.forEach((btn) => {
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
        return;
      }

      if (e.target.closest('.edit-btn')) {
        e.stopPropagation();
        currentlyEditingId = noteId;
        const note = allNotes.find((n) => n.id == noteId);
        if (note) {
          document.getElementById('modal-note-title').value = note.title;
          document.getElementById('modal-note-content').value = note.description;
          document.getElementById('modal-note-color').value = note.color || '#fff7b1';
          document.getElementById('update-modal').style.display = 'flex';
        }
        return;
      }

      if (e.target.closest('.starred-btn')) {
        e.stopPropagation();
        const res = await toggleStar(noteId);
        if (res.success) loadAndRenderNotes();
        return;
      }

      const note = allNotes.find((n) => n.id == noteId);
      if (note) {
        document.getElementById('view-note-title').innerText = note.title;
        document.getElementById('view-note-description').innerHTML = makeLinksClickable(note.description || '');
        document.getElementById('note-view-color').style.backgroundColor = note.color || '#fff7b1';
        document.getElementById('note-view-modal').classList.add('active');
      }
    });
  }
}

window.closeNoteView = function () {
  const modal = document.getElementById('note-view-modal');
  if (modal) modal.classList.remove('active');
};

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
  attachNotesPageHandlers,
};
