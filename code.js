class NotesApp {
     constructor() {
        this.notes = [];
        this.activeNoteId = null;
        this.showSidebar = true;
        this.searchQuery = '';
        this.saveTimeout = null;

        // Cache DOM Elements
        this.sidebarEl = document.getElementById('sidebar');
        this.sidebarToggleEl = document.getElementById('sidebarToggle');
        this.sidebarToggleIconEl = document.getElementById('sidebarToggleIcon');
        this.mainContentEl = document.getElementById('mainContent');
        this.newNoteBtnEl = document.getElementById('newNoteBtn');
        this.searchInputEl = document.getElementById('searchInput');
        this.notesListEl = document.getElementById('notesList');
        this.notepadContainerEl = document.getElementById('notepadContainer');
        this.toolbarEl = document.getElementById('toolbar');
        this.titleInputEl = document.getElementById('titleInput');
        this.noteContentEl = document.getElementById('noteContent');
        this.wordCountEl = document.getElementById('wordCount');
        this.charCountEl = document.getElementById('charCount');
        this.tooltipToggleTextEl = this.sidebarToggleEl.querySelector('.tooltip-text');

        this.loadNotes();
        this.initToolbar(); // Cria a toolbar uma vez
        this.bindEvents();
        this.renderInitialState();
    }

     initToolbar() {
         // HTML da Toolbar com classes Tailwind e ícones Lucide
         this.toolbarEl.innerHTML = `
             {/* Select de Formato */}
             <div class="relative">
                 <select id="formatBlockSelect"
                         class="h-8 text-xs font-medium text-surface-700 bg-white border border-surface-300 rounded-md shadow-sm appearance-none pl-3 pr-7 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 cursor-pointer hover:border-surface-400"
                         onchange="app.formatDoc('formatBlock', this.value); this.selectedIndex=0;">
                     <option value="" selected disabled>Formato</option>
                     <option value="p">Parágrafo</option>
                     <option value="h1">Título 1</option>
                     <option value="h2">Título 2</option>
                     <option value="blockquote">Citação</option>
                 </select>
                 <i data-lucide="chevron-down" class="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400 pointer-events-none"></i>
             </div>

             {/* Separador Vertical */}
             <div class="toolbar-separator w-px h-5 bg-surface-300 mx-1.5"></div>

             {/* Botões de Formatação Simples */}
             <button class="toolbar-button group tooltip relative p-1.5 rounded hover:bg-surface-200 focus:outline-none focus:ring-1 focus:ring-primary-300" data-command="bold" aria-label="Negrito">
                 <i data-lucide="bold" class="w-4 h-4 text-surface-700 pointer-events-none"></i>
                 <span class="tooltip-text">Negrito</span>
             </button>
             <button class="toolbar-button group tooltip relative p-1.5 rounded hover:bg-surface-200 focus:outline-none focus:ring-1 focus:ring-primary-300" data-command="italic" aria-label="Itálico">
                 <i data-lucide="italic" class="w-4 h-4 text-surface-700 pointer-events-none"></i>
                 <span class="tooltip-text">Itálico</span>
             </button>
             <button class="toolbar-button group tooltip relative p-1.5 rounded hover:bg-surface-200 focus:outline-none focus:ring-1 focus:ring-primary-300" data-command="underline" aria-label="Sublinhado">
                 <i data-lucide="underline" class="w-4 h-4 text-surface-700 pointer-events-none"></i>
                 <span class="tooltip-text">Sublinhado</span>
             </button>
             <button class="toolbar-button group tooltip relative p-1.5 rounded hover:bg-surface-200 focus:outline-none focus:ring-1 focus:ring-primary-300" data-command="strikeThrough" aria-label="Tachado">
                 <i data-lucide="strikethrough" class="w-4 h-4 text-surface-700 pointer-events-none"></i>
                 <span class="tooltip-text">Tachado</span>
             </button>

             {/* Pickers de Cor */}
             <div class="toolbar-color-picker group tooltip relative inline-flex items-center" aria-label="Cor do Texto">
                 <label for="foreColorPicker" class="toolbar-button p-1.5 rounded hover:bg-surface-200 cursor-pointer">
                     <i data-lucide="type" class="w-4 h-4 text-surface-700 pointer-events-none"></i>
                 </label>
                 <input type="color" id="foreColorPicker" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" oninput="app.formatDoc('foreColor', this.value)">
                 <span class="tooltip-text">Cor Texto</span>
             </div>
             <div class="toolbar-color-picker group tooltip relative inline-flex items-center" aria-label="Cor do Realce">
                  <label for="hiliteColorPicker" class="toolbar-button p-1.5 rounded hover:bg-surface-200 cursor-pointer">
                      <i data-lucide="highlighter" class="w-4 h-4 text-surface-700 pointer-events-none"></i>
                  </label>
                  <input type="color" id="hiliteColorPicker" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" oninput="app.formatDoc('hiliteColor', this.value)">
                 <span class="tooltip-text">Realce</span>
             </div>

             {/* Separador Vertical */}
             <div class="toolbar-separator w-px h-5 bg-surface-300 mx-1.5"></div>

             {/* Botões de Lista */}
             <button class="toolbar-button group tooltip relative p-1.5 rounded hover:bg-surface-200 focus:outline-none focus:ring-1 focus:ring-primary-300" data-command="insertUnorderedList" aria-label="Lista com Marcadores">
                 <i data-lucide="list" class="w-4 h-4 text-surface-700 pointer-events-none"></i>
                 <span class="tooltip-text">Lista Marcadores</span>
             </button>
             <button class="toolbar-button group tooltip relative p-1.5 rounded hover:bg-surface-200 focus:outline-none focus:ring-1 focus:ring-primary-300" data-command="insertOrderedList" aria-label="Lista Numerada">
                 <i data-lucide="list-ordered" class="w-4 h-4 text-surface-700 pointer-events-none"></i>
                 <span class="tooltip-text">Lista Numerada</span>
             </button>

             {/* Separador Vertical */}
             <div class="toolbar-separator w-px h-5 bg-surface-300 mx-1.5"></div>

             {/* Botões de Alinhamento */}
             <button class="toolbar-button group tooltip relative p-1.5 rounded hover:bg-surface-200 focus:outline-none focus:ring-1 focus:ring-primary-300" data-command="justifyLeft" aria-label="Alinhar à Esquerda">
                 <i data-lucide="align-left" class="w-4 h-4 text-surface-700 pointer-events-none"></i>
                 <span class="tooltip-text">Alinhar Esquerda</span>
             </button>
             <button class="toolbar-button group tooltip relative p-1.5 rounded hover:bg-surface-200 focus:outline-none focus:ring-1 focus:ring-primary-300" data-command="justifyCenter" aria-label="Centralizar">
                 <i data-lucide="align-center" class="w-4 h-4 text-surface-700 pointer-events-none"></i>
                 <span class="tooltip-text">Centralizar</span>
             </button>
             <button class="toolbar-button group tooltip relative p-1.5 rounded hover:bg-surface-200 focus:outline-none focus:ring-1 focus:ring-primary-300" data-command="justifyRight" aria-label="Alinhar à Direita">
                 <i data-lucide="align-right" class="w-4 h-4 text-surface-700 pointer-events-none"></i>
                 <span class="tooltip-text">Alinhar Direita</span>
             </button>
             <button class="toolbar-button group tooltip relative p-1.5 rounded hover:bg-surface-200 focus:outline-none focus:ring-1 focus:ring-primary-300" data-command="justifyFull" aria-label="Justificar">
                 <i data-lucide="align-justify" class="w-4 h-4 text-surface-700 pointer-events-none"></i>
                 <span class="tooltip-text">Justificar</span>
             </button>

             {/* Separador Vertical */}
             <div class="toolbar-separator w-px h-5 bg-surface-300 mx-1.5"></div>

             {/* Botões Undo/Redo */}
             <button class="toolbar-button group tooltip relative p-1.5 rounded hover:bg-surface-200 focus:outline-none focus:ring-1 focus:ring-primary-300" data-command="undo" aria-label="Desfazer">
                 <i data-lucide="undo-2" class="w-4 h-4 text-surface-700 pointer-events-none"></i>
                 <span class="tooltip-text">Desfazer</span>
             </button>
             <button class="toolbar-button group tooltip relative p-1.5 rounded hover:bg-surface-200 focus:outline-none focus:ring-1 focus:ring-primary-300" data-command="redo" aria-label="Refazer">
                 <i data-lucide="redo-2" class="w-4 h-4 text-surface-700 pointer-events-none"></i>
                 <span class="tooltip-text">Refazer</span>
             </button>
         `;

         this.toolbarEl.addEventListener('click', (event) => {
             const button = event.target.closest('button[data-command]');
             const colorLabel = event.target.closest('.toolbar-color-picker label');
             if (button) { this.formatDoc(button.dataset.command); }
         });
         // Renderiza ícones Lucide APÓS adicionar o HTML ao DOM
         if (typeof lucide !== 'undefined') {
             lucide.createIcons({ nodes: this.toolbarEl.querySelectorAll('[data-lucide]') });
         }
     }

     loadNotes() {
        const savedNotes = localStorage.getItem('macOsNotesV4_Tailwind'); // << Nova chave
        try { this.notes = savedNotes ? JSON.parse(savedNotes) : []; }
        catch (e) { console.error("Erro ao carregar notas:", e); this.notes = []; }
        this.notes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    }

    saveNotes() {
        const activeNote = this.notes.find(n => n.id === this.activeNoteId);
        if (activeNote) {
            activeNote.lastModified = new Date().toISOString();
            this.notes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        }
        try { localStorage.setItem('macOsNotesV4_Tailwind', JSON.stringify(this.notes)); } // << Nova chave
        catch (e) { console.error("Erro ao salvar notas:", e); }
    }

    debounceSave() { clearTimeout(this.saveTimeout); this.saveTimeout = setTimeout(() => this.saveNotes(), 800); }

    bindEvents() {
        this.newNoteBtnEl.addEventListener('click', () => this.handleNewNote());
        this.searchInputEl.addEventListener('input', (e) => this.handleSearchInput(e.target.value));
        this.titleInputEl.addEventListener('input', (e) => this.handleTitleInput(e.target.value));
        this.noteContentEl.addEventListener('input', () => this.handleContentInput());
        this.noteContentEl.addEventListener('focus', () => this.updateToolbar());
        this.noteContentEl.addEventListener('click', () => this.updateToolbar());
        this.noteContentEl.addEventListener('keyup', () => this.updateToolbar());
        document.addEventListener('selectionchange', () => {
            if (document.activeElement === this.noteContentEl || this.noteContentEl.contains(document.activeElement)) {
                 this.updateToolbar();
            }
         });
        this.sidebarToggleEl.addEventListener('click', () => this.toggleSidebar());
        this.notesListEl.addEventListener('click', (event) => {
            const targetCard = event.target.closest('.note-card');
            const targetDelete = event.target.closest('.delete-button');
            if (targetDelete && targetCard?.dataset.noteId) {
                 // Evita que o clique no botão de deletar selecione a nota
                 event.stopPropagation();
                 this.handleDeleteNote(targetCard.dataset.noteId);
            } else if (targetCard?.dataset.noteId) {
                 this.handleSelectNote(targetCard.dataset.noteId);
            }
        });
    }

     renderInitialState() {
         if (this.notes.length === 0) { this.handleNewNote(false); }
         else {
             this.activeNoteId = this.notes[0]?.id || null;
             if (!this.activeNoteId) { this.handleNewNote(false); return; }
         }
         this.renderSidebarNotes();
         this.renderEditorContent();
         this.updateSidebarToggle();
         this.updateToolbar();
         // Renderiza ícones estáticos (fora da toolbar e lista de notas)
         if (typeof lucide !== 'undefined') {
             lucide.createIcons();
         }
    }

    handleNewNote(focusTitle = true) {
        const newNote = { id: Date.now().toString(), title: '', content: '', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() };
        this.notes.unshift(newNote);
        this.activeNoteId = newNote.id;
        this.searchInputEl.value = ''; this.searchQuery = '';
        this.saveNotes();
        this.renderSidebarNotes();
        this.renderEditorContent();
         if (focusTitle) { this.titleInputEl.focus(); }
         this.updateToolbar();
    }

    handleSearchInput(query) { this.searchQuery = query.toLowerCase().trim(); this.renderSidebarNotes(); }

    handleSelectNote(noteId) {
        if (noteId === this.activeNoteId) return;
        this.activeNoteId = noteId;
        this.renderSidebarNotes();
        this.renderEditorContent();
        this.noteContentEl.focus();
        this.updateToolbar();
    }

    handleDeleteNote(noteId) {
        if (!window.confirm('Tem certeza que deseja excluir esta nota?')) return;
        const noteIndex = this.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return;

        const wasActive = this.activeNoteId === noteId;

        this.notes.splice(noteIndex, 1); // Remove a nota

        if (wasActive) {
            if (this.notes.length > 0) {
                const nextActiveIndex = Math.max(0, Math.min(noteIndex, this.notes.length - 1)); // Tenta índice atual ou anterior
                this.activeNoteId = this.notes[nextActiveIndex].id;
            } else {
                this.activeNoteId = null; // Nenhuma nota restante
            }

             if (!this.activeNoteId) {
                 this.handleNewNote(false); // Cria nova se lista ficar vazia
                 return; // handleNewNote já salva e renderiza
             } else {
                 this.renderEditorContent(); // Renderiza a nova nota ativa
             }
         }
         // Se a nota excluída não era a ativa, apenas salva e re-renderiza a lista
         this.saveNotes();
         this.renderSidebarNotes();
         // Não precisa chamar renderEditorContent se a nota ativa não mudou
    }

    handleTitleInput(newTitle) {
        const activeNote = this.notes.find(n => n.id === this.activeNoteId);
        if (activeNote) {
            activeNote.title = newTitle; this.debounceSave();
            const cardTitleEl = this.notesListEl.querySelector(`.note-card[data-note-id="${this.activeNoteId}"] .note-card-title`);
            if (cardTitleEl) { cardTitleEl.textContent = newTitle || 'Nota sem título'; }
         }
    }

    handleContentInput() {
        const activeNote = this.notes.find(n => n.id === this.activeNoteId);
        if (activeNote) {
            activeNote.content = this.noteContentEl.innerHTML; this.updateCounters(); this.debounceSave();
             const cardSnippetEl = this.notesListEl.querySelector(`.note-card[data-note-id="${this.activeNoteId}"] .note-card-snippet`);
             const cardMetaEl = this.notesListEl.querySelector(`.note-card[data-note-id="${this.activeNoteId}"] .note-card-meta`);
            if(cardSnippetEl) { const snippet = this.getSnippet(activeNote.content, 50); cardSnippetEl.innerHTML = `${snippet.text || '<span class="italic text-surface-400">Nota vazia</span>'}${snippet.truncated ? '...' : ''}`; }
             if(cardMetaEl) {
                 const wordCountSpan = cardMetaEl.querySelector('.word-count');
                 if (wordCountSpan) {
                     const wordCount = this.countWords(activeNote.content);
                     wordCountSpan.textContent = `${wordCount} ${wordCount === 1 ? 'palavra' : 'palavras'}`;
                 }
             }
        }
    }

    toggleSidebar() { this.showSidebar = !this.showSidebar; this.updateSidebarToggle(); }

     updateSidebarToggle() {
         this.sidebarEl.classList.toggle('sidebar-hidden', !this.showSidebar);
         this.sidebarToggleIconEl.setAttribute('data-lucide', this.showSidebar ? 'chevron-left' : 'chevron-right');
         if (this.tooltipToggleTextEl) { this.tooltipToggleTextEl.textContent = this.showSidebar ? 'Ocultar Barra Lateral' : 'Mostrar Barra Lateral'; }
         if (typeof lucide !== 'undefined') {
             lucide.createIcons({ nodes: [this.sidebarToggleIconEl]});
         }
     }

    renderSidebarNotes() {
         const filtered = this.filteredNotes();
         this.notesListEl.innerHTML = '';
         if (filtered.length === 0 && this.searchQuery) {
             this.notesListEl.innerHTML = `<div class="p-4 text-center text-sm text-surface-500"><i data-lucide="search" class="mx-auto mb-2 w-8 h-8 opacity-50"></i>Nenhuma nota encontrada para "${this.searchQuery}".</div>`;
         } else if (filtered.length === 0) {
             this.notesListEl.innerHTML = `<div class="p-4 text-center text-sm text-surface-500"><i data-lucide="file-plus" class="mx-auto mb-2 w-8 h-8 opacity-50"></i>Crie sua primeira nota!</div>`;
         } else {
             const fragment = document.createDocumentFragment();
             filtered.forEach(note => { const card = this.createNoteCardElement(note); fragment.appendChild(card); });
             this.notesListEl.appendChild(fragment);
         }
         // Renderiza ícones Lucide APÓS adicionar os cards ao DOM
         if (typeof lucide !== 'undefined') {
             lucide.createIcons({ nodes: this.notesListEl.querySelectorAll('[data-lucide]') });
         }
    }

     createNoteCardElement(note) {
         const snippetData = this.getSnippet(note.content, 50);
         const isActive = note.id === this.activeNoteId;
         const wordCount = this.countWords(note.content);
         const lastModifiedDate = new Date(note.lastModified).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
         const card = document.createElement('div');
         card.className = `note-card group relative p-3 rounded-lg cursor-pointer border transition-all duration-150 ease-in-out ${isActive ? 'bg-white border-primary-400 shadow-sm ring-1 ring-primary-200' : 'border-transparent hover:bg-white/60 hover:border-surface-200'}`;
         card.dataset.noteId = note.id;
         card.innerHTML = `
             <div class="flex justify-between items-start mb-1.5">
                 <span class="note-card-title font-semibold text-sm text-dark-800 truncate pr-6 flex-1">${note.title || 'Nota sem título'}</span>
                 <button class="delete-button absolute top-2 right-2 p-1 rounded-full text-red-400/80 hover:bg-red-100 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Excluir Nota">
                     <i data-lucide="x" class="w-3.5 h-3.5 pointer-events-none"></i>
                 </button>
             </div>
             <p class="note-card-snippet text-xs text-surface-600 leading-tight h-8 overflow-hidden mb-2">${snippetData.text || '<span class="italic text-surface-400">Nota vazia</span>'}${snippetData.truncated ? '...' : ''}</p>
             <div class="note-card-meta text-[11px] text-surface-400 flex justify-between items-center">
                 <span>${lastModifiedDate}</span>
                 <span class="word-count">${wordCount} ${wordCount === 1 ? 'palavra' : 'palavras'}</span>
             </div>
         `;
         return card;
    }

     getSnippet(htmlContent, maxLength = 60) {
         if (!htmlContent) return { text: '', truncated: false };
         const tempDiv = document.createElement('div'); tempDiv.innerHTML = htmlContent;
         const text = (tempDiv.textContent || tempDiv.innerText || '').trim();
         const truncated = text.length > maxLength;
         const cleanText = text.substring(0, maxLength).replace(/\s+/g, ' ');
         return { text: cleanText, truncated };
     }

     filteredNotes() {
         if (!this.searchQuery) return this.notes;
         return this.notes.filter(note =>
             note.title.toLowerCase().includes(this.searchQuery) ||
             this.getSnippet(note.content, 1000).text.toLowerCase().includes(this.searchQuery)
         );
     }

    renderEditorContent() {
        const activeNote = this.notes.find(note => note.id === this.activeNoteId);
        const editorIsActive = !!activeNote;
        this.titleInputEl.value = activeNote?.title || '';
        this.noteContentEl.innerHTML = activeNote?.content || '';
        this.titleInputEl.disabled = !editorIsActive;
        this.noteContentEl.contentEditable = editorIsActive;
        this.toolbarEl.style.opacity = editorIsActive ? '1' : '0.6';
        this.toolbarEl.style.pointerEvents = editorIsActive ? 'auto' : 'none';
         this.notepadContainerEl.classList.toggle('border-primary-300', editorIsActive);
         this.notepadContainerEl.classList.toggle('border-white/30', !editorIsActive);
        this.updateCounters();
        this.updateToolbar();
    }

    formatDoc(command, value = null) {
        if (!this.noteContentEl.isContentEditable) return;
        this.noteContentEl.focus();
        document.execCommand(command, false, value);
        this.updateToolbar(); // Atualiza o estado visual da toolbar
        this.handleContentInput(); // Salva o conteúdo modificado
    }

     updateToolbar() {
         requestAnimationFrame(() => {
             const buttons = this.toolbarEl.querySelectorAll('.toolbar-button');
             const editorIsActive = this.noteContentEl.isContentEditable;

             buttons.forEach(button => {
                 const command = button.dataset.command;
                 button.disabled = !editorIsActive;
                 // Limpa o estado visual ativo
                 button.classList.remove('bg-primary-100');
                 const icon = button.querySelector('[data-lucide]');
                 if (icon) {
                     icon.classList.remove('text-primary-600');
                     icon.classList.add('text-surface-700');
                 }

                 // Aplica estado ativo se necessário
                 if (editorIsActive && command) {
                     const stateCommands = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList'];
                     if (stateCommands.includes(command)) {
                         try {
                             const isActive = document.queryCommandState(command);
                             button.classList.toggle('bg-primary-100', isActive);
                             if (icon) {
                                 icon.classList.toggle('text-primary-600', isActive);
                                 icon.classList.toggle('text-surface-700', !isActive);
                             }
                         } catch (e) { /* Ignora erros do queryCommandState */ }
                     }
                 }
                 // Adiciona efeito visual de desabilitado
                  button.classList.toggle('opacity-50', !editorIsActive);
                  button.classList.toggle('cursor-not-allowed', !editorIsActive);

             });

             // Atualiza o select
             const formatSelect = this.toolbarEl.querySelector('#formatBlockSelect');
             if (formatSelect) {
                 formatSelect.disabled = !editorIsActive;
                 formatSelect.classList.toggle('opacity-50', !editorIsActive);
                 formatSelect.classList.toggle('cursor-not-allowed', !editorIsActive);
             }

              // Atualiza os color pickers
              const colorPickers = this.toolbarEl.querySelectorAll('.toolbar-color-picker');
              colorPickers.forEach(picker => {
                  const input = picker.querySelector('input[type="color"]');
                  const label = picker.querySelector('label');
                  if (input) input.disabled = !editorIsActive;
                  if (label) {
                      label.classList.toggle('opacity-50', !editorIsActive);
                      label.classList.toggle('cursor-not-allowed', !editorIsActive);
                      label.style.pointerEvents = editorIsActive ? 'auto' : 'none';
                  }
              });
         });
     }

    countWords(htmlContent) {
         if (!htmlContent) return 0;
         const tempDiv = document.createElement('div'); tempDiv.innerHTML = htmlContent;
         const text = tempDiv.textContent || ''; const trimmedText = text.trim();
         return trimmedText === '' ? 0 : trimmedText.split(/\s+/).filter(Boolean).length;
     }

    countCharacters(htmlContent) {
         if (!htmlContent) return 0;
         const tempDiv = document.createElement('div'); tempDiv.innerHTML = htmlContent;
         return (tempDiv.textContent || '').length;
     }

    updateCounters() {
        const htmlContent = this.noteContentEl?.innerHTML || '';
        const wordCount = this.countWords(htmlContent);
        const charCount = this.countCharacters(htmlContent);
        this.wordCountEl.textContent = `${wordCount} ${wordCount === 1 ? 'palavra' : 'palavras'}`;
        this.charCountEl.textContent = `${charCount} ${charCount === 1 ? 'caractere' : 'caracteres'}`;
    }
} // Fim da classe NotesApp

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NotesApp(); // Torna 'app' global para handlers inline
});