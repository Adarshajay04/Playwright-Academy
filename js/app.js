// Playwright Academy - Core Application Logic

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    currentModule: null,
    currentSection: null,
    completed: JSON.parse(localStorage.getItem('pw-completed') || '{}'),
    quizAnswers: {},
    theme: localStorage.getItem('pw-theme') || 'dark'
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    initSearch();
    initKeyboardShortcuts();
    initScrollEffects();
    
    // Handle URL hash navigation
    if (window.location.hash) {
        const [moduleId, sectionId] = window.location.hash.slice(1).split('/');
        if (moduleId && sectionId) {
            navigateToSection(moduleId, sectionId);
        }
    }

    // Update stats
    const statEl = document.getElementById('moduleCountStat');
    if (statEl) statEl.textContent = window.PLAYWRIGHT_MODULES.length + '+';
    
    // Build curriculum grid on landing
    buildCurriculumGrid();
});

// ============================================
// THEME MANAGEMENT
// ============================================
function initTheme() {
    if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    document.getElementById('themeToggle').addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('pw-theme', state.theme);
    });
}

// ============================================
// SIDEBAR
// ============================================
function initSidebar() {
    const nav = document.getElementById('sidebarNav');
    const modules = window.PLAYWRIGHT_MODULES;
    
    // Sort modules by their id number
    modules.sort((a, b) => {
        const numA = parseInt(a.id.replace('module-', ''));
        const numB = parseInt(b.id.replace('module-', ''));
        return numA - numB;
    });
    
    let html = '';
    modules.forEach((mod, index) => {
        const isExpanded = index === 0 ? 'expanded' : '';
        html += `
            <div class="nav-module-group ${isExpanded}" data-module="${mod.id}">
                <button onclick="toggleModule('${mod.id}')" 
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors group">
                    <span class="text-lg">${mod.icon || '📘'}</span>
                    <span class="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white truncate">${mod.title}</span>
                    <i class="fas fa-chevron-right module-toggle-icon text-xs text-gray-400"></i>
                </button>
                <div class="nav-section-list pl-4">
                    ${mod.sections.map(sec => {
                        const isCompleted = state.completed[`${mod.id}/${sec.id}`];
                        return `
                            <a href="#${mod.id}/${sec.id}" 
                                onclick="navigateToSection('${mod.id}', '${sec.id}'); return false;"
                                class="nav-section-link flex items-center gap-2 px-3 py-1.5 ml-4 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-md border-l-2 border-transparent hover:bg-gray-50 dark:hover:bg-surface-800/50 transition-all ${isCompleted ? 'section-completed' : ''}"
                                data-section="${mod.id}/${sec.id}">
                                <span class="w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} flex-shrink-0"></span>
                                <span class="truncate">${sec.title}</span>
                            </a>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    nav.innerHTML = html;
    updateProgress();
}

function toggleModule(moduleId) {
    const group = document.querySelector(`.nav-module-group[data-module="${moduleId}"]`);
    group.classList.toggle('expanded');
}

function openSidebar() {
    document.getElementById('sidebar').classList.remove('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.add('hidden');
    document.body.style.overflow = '';
}

document.getElementById('menuToggle').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('-translate-x-full')) {
        openSidebar();
    } else {
        closeSidebar();
    }
});

// ============================================
// NAVIGATION
// ============================================
function getAllSections() {
    const sections = [];
    window.PLAYWRIGHT_MODULES.forEach(mod => {
        mod.sections.forEach(sec => {
            sections.push({ moduleId: mod.id, moduleTitle: mod.title, sectionId: sec.id, sectionTitle: sec.title });
        });
    });
    return sections;
}

function navigateToSection(moduleId, sectionId) {
    const mod = window.PLAYWRIGHT_MODULES.find(m => m.id === moduleId);
    if (!mod) return;
    
    const section = mod.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    state.currentModule = moduleId;
    state.currentSection = sectionId;
    state.quizAnswers = {};
    
    // Show lesson page, hide landing
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('lessonPage').classList.remove('hidden');
    
    // Update breadcrumb
    document.getElementById('breadcrumbModule').textContent = mod.title;
    document.getElementById('breadcrumbSection').textContent = section.title;
    
    // Set content
    const contentEl = document.getElementById('lessonContent');
    contentEl.innerHTML = section.content;
    contentEl.classList.add('content-fade-in');
    setTimeout(() => contentEl.classList.remove('content-fade-in'), 300);
    
    // Apply syntax highlighting
    contentEl.querySelectorAll('pre code').forEach(block => {
        Prism.highlightElement(block);
    });
    
    // Setup quiz
    if (section.quiz && section.quiz.questions && section.quiz.questions.length > 0) {
        document.getElementById('quizSection').classList.remove('hidden');
        renderQuiz(section.quiz.questions);
    } else {
        document.getElementById('quizSection').classList.add('hidden');
    }
    
    // Update prev/next navigation
    updateNavButtons();
    
    // Update sidebar active state
    document.querySelectorAll('.nav-section-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === `${moduleId}/${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Expand the module group
    document.querySelectorAll('.nav-module-group').forEach(group => {
        if (group.dataset.module === moduleId) {
            group.classList.add('expanded');
        }
    });
    
    // Mark as completed
    state.completed[`${moduleId}/${sectionId}`] = true;
    localStorage.setItem('pw-completed', JSON.stringify(state.completed));
    updateProgress();
    
    // Update URL hash
    window.location.hash = `${moduleId}/${sectionId}`;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Close mobile sidebar
    closeSidebar();
}

function updateNavButtons() {
    const allSections = getAllSections();
    const currentIndex = allSections.findIndex(
        s => s.moduleId === state.currentModule && s.sectionId === state.currentSection
    );
    
    const prevBtn = document.getElementById('prevLesson');
    const nextBtn = document.getElementById('nextLesson');
    const prevTitle = document.getElementById('prevLessonTitle');
    const nextTitle = document.getElementById('nextLessonTitle');
    
    if (currentIndex > 0) {
        const prev = allSections[currentIndex - 1];
        prevBtn.classList.remove('invisible');
        prevTitle.textContent = prev.sectionTitle;
    } else {
        prevBtn.classList.add('invisible');
    }
    
    if (currentIndex < allSections.length - 1) {
        const next = allSections[currentIndex + 1];
        nextBtn.classList.remove('invisible');
        nextTitle.textContent = next.sectionTitle;
    } else {
        nextBtn.classList.add('invisible');
    }
}

function navigatePrev() {
    const allSections = getAllSections();
    const currentIndex = allSections.findIndex(
        s => s.moduleId === state.currentModule && s.sectionId === state.currentSection
    );
    if (currentIndex > 0) {
        const prev = allSections[currentIndex - 1];
        navigateToSection(prev.moduleId, prev.sectionId);
    }
}

function navigateNext() {
    const allSections = getAllSections();
    const currentIndex = allSections.findIndex(
        s => s.moduleId === state.currentModule && s.sectionId === state.currentSection
    );
    if (currentIndex < allSections.length - 1) {
        const next = allSections[currentIndex + 1];
        navigateToSection(next.moduleId, next.sectionId);
    }
}

function showLanding() {
    document.getElementById('landingPage').classList.remove('hidden');
    document.getElementById('lessonPage').classList.add('hidden');
    state.currentModule = null;
    state.currentSection = null;
    window.location.hash = '';
    
    // Deactivate sidebar links
    document.querySelectorAll('.nav-section-link').forEach(link => link.classList.remove('active'));
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// PROGRESS TRACKING
// ============================================
function updateProgress() {
    let total = 0;
    let completed = 0;
    
    window.PLAYWRIGHT_MODULES.forEach(mod => {
        mod.sections.forEach(sec => {
            total++;
            if (state.completed[`${mod.id}/${sec.id}`]) completed++;
        });
    });
    
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressText').textContent = pct + '%';
    document.getElementById('sidebarProgress').textContent = pct + '%';
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('totalCount').textContent = total;
    
    // Update sidebar dot colors
    document.querySelectorAll('.nav-section-link').forEach(link => {
        const key = link.dataset.section;
        const dot = link.querySelector('span.rounded-full');
        if (state.completed[key] && dot) {
            dot.classList.remove('bg-gray-300', 'dark:bg-gray-600');
            dot.classList.add('bg-green-500');
        }
    });
}

// ============================================
// COPY CODE
// ============================================
function copyCode(btn) {
    const codeBlock = btn.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    });
}

// ============================================
// QUIZ SYSTEM
// ============================================
function renderQuiz(questions) {
    const container = document.getElementById('quizContainer');
    const resultsEl = document.getElementById('quizResults');
    const submitBtn = document.getElementById('submitQuiz');
    
    resultsEl.classList.add('hidden');
    submitBtn.classList.remove('hidden');
    submitBtn.textContent = 'Check Answers';
    
    let html = '';
    questions.forEach((q, qIndex) => {
        html += `
            <div class="quiz-question" data-question="${qIndex}">
                <p class="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    <span class="text-primary-500 font-bold mr-2">Q${qIndex + 1}.</span>
                    ${q.question}
                </p>
                <div class="space-y-1">
                    ${q.options.map((opt, oIndex) => `
                        <div class="quiz-option" onclick="selectOption(${qIndex}, ${oIndex})" data-question="${qIndex}" data-option="${oIndex}">
                            <div class="quiz-radio"></div>
                            <span>${opt}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="quiz-explanation hidden mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30">
                    <i class="fas fa-lightbulb mr-1"></i> ${q.explanation || ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function selectOption(questionIndex, optionIndex) {
    state.quizAnswers[questionIndex] = optionIndex;
    
    // Update UI
    const options = document.querySelectorAll(`.quiz-option[data-question="${questionIndex}"]`);
    options.forEach((opt, i) => {
        opt.classList.toggle('selected', i === optionIndex);
    });
}

function submitQuiz() {
    const mod = window.PLAYWRIGHT_MODULES.find(m => m.id === state.currentModule);
    const section = mod.sections.find(s => s.id === state.currentSection);
    const questions = section.quiz.questions;
    
    let correct = 0;
    let total = questions.length;
    
    questions.forEach((q, qIndex) => {
        const options = document.querySelectorAll(`.quiz-option[data-question="${qIndex}"]`);
        const selected = state.quizAnswers[qIndex];
        
        options.forEach((opt, oIndex) => {
            opt.style.pointerEvents = 'none';
            if (oIndex === q.correct) {
                opt.classList.add('correct');
            } else if (oIndex === selected && oIndex !== q.correct) {
                opt.classList.add('incorrect');
            }
        });
        
        if (selected === q.correct) correct++;
        
        // Show explanation
        const questionEl = document.querySelector(`.quiz-question[data-question="${qIndex}"]`);
        const explanationEl = questionEl.querySelector('.quiz-explanation');
        if (explanationEl && q.explanation) {
            explanationEl.classList.remove('hidden');
        }
    });
    
    // Show results
    const resultsEl = document.getElementById('quizResults');
    const pct = Math.round((correct / total) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚';
    const message = pct >= 80 ? 'Excellent work!' : pct >= 50 ? 'Good effort! Review the explanations above.' : 'Keep learning! Review this section and try again.';
    
    resultsEl.innerHTML = `
        <div class="flex items-center gap-4">
            <div class="text-4xl">${emoji}</div>
            <div>
                <div class="font-bold text-lg ${pct >= 80 ? 'text-green-600 dark:text-green-400' : pct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}">
                    ${correct}/${total} Correct (${pct}%)
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">${message}</div>
            </div>
        </div>
    `;
    resultsEl.className = `mt-6 p-6 rounded-xl border ${pct >= 80 ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : pct >= 50 ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'}`;
    resultsEl.classList.remove('hidden');
    
    // Hide submit button, show retry
    const submitBtn = document.getElementById('submitQuiz');
    submitBtn.textContent = '🔄 Retry Quiz';
    submitBtn.onclick = () => {
        state.quizAnswers = {};
        renderQuiz(questions);
        submitBtn.onclick = submitQuiz;
    };
}

// ============================================
// SEARCH
// ============================================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchResultsList = document.getElementById('searchResultsList');
    
    let debounceTimer;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length < 2) {
                searchResults.classList.add('hidden');
                return;
            }
            
            const results = searchModules(query);
            if (results.length === 0) {
                searchResultsList.innerHTML = '<div class="p-6 text-center text-gray-500"><i class="fas fa-search text-2xl mb-2"></i><p>No results found</p></div>';
            } else {
                searchResultsList.innerHTML = results.map(r => `
                    <a href="#${r.moduleId}/${r.sectionId}" 
                        onclick="navigateToSection('${r.moduleId}', '${r.sectionId}'); document.getElementById('searchResults').classList.add('hidden'); document.getElementById('searchInput').value = ''; return false;"
                        class="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors cursor-pointer">
                        <i class="fas fa-file-alt text-gray-400 mt-1"></i>
                        <div>
                            <div class="text-sm font-semibold text-gray-800 dark:text-gray-200">${r.sectionTitle}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${r.moduleTitle}</div>
                            ${r.snippet ? `<div class="text-xs text-gray-400 mt-1">${r.snippet}</div>` : ''}
                        </div>
                    </a>
                `).join('');
            }
            
            searchResults.classList.remove('hidden');
        }, 200);
    });
    
    // Close search on click outside
    document.addEventListener('click', (e) => {
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.classList.add('hidden');
        }
    });
    
    // Mobile search toggle
    const mobileToggle = document.getElementById('searchToggleMobile');
    const mobileSearch = document.getElementById('mobileSearch');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileSearch.classList.toggle('hidden');
        });
    }
    
    // Mobile search input
    const mobileInput = document.querySelector('.mobile-search-input');
    if (mobileInput) {
        mobileInput.addEventListener('input', (e) => {
            searchInput.value = e.target.value;
            searchInput.dispatchEvent(new Event('input'));
        });
    }
}

function searchModules(query) {
    const results = [];
    
    window.PLAYWRIGHT_MODULES.forEach(mod => {
        mod.sections.forEach(sec => {
            const titleMatch = sec.title.toLowerCase().includes(query);
            const contentText = sec.content.replace(/<[^>]+>/g, '').toLowerCase();
            const contentMatch = contentText.includes(query);
            
            if (titleMatch || contentMatch) {
                let snippet = '';
                if (contentMatch) {
                    const idx = contentText.indexOf(query);
                    const start = Math.max(0, idx - 40);
                    const end = Math.min(contentText.length, idx + query.length + 40);
                    snippet = '...' + contentText.slice(start, end).replace(query, `<span class="search-highlight">${query}</span>`) + '...';
                }
                
                results.push({
                    moduleId: mod.id,
                    moduleTitle: mod.title,
                    sectionId: sec.id,
                    sectionTitle: sec.title,
                    snippet,
                    score: titleMatch ? 2 : 1
                });
            }
        });
    });
    
    return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+K or Cmd+K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        // Escape to close search
        if (e.key === 'Escape') {
            document.getElementById('searchResults').classList.add('hidden');
            document.getElementById('searchInput').blur();
        }
        
        // Arrow keys for navigation (when not in input)
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.key === 'ArrowLeft' && state.currentSection) {
            navigatePrev();
        }
        if (e.key === 'ArrowRight' && state.currentSection) {
            navigateNext();
        }
    });
}

// ============================================
// SCROLL EFFECTS
// ============================================
function initScrollEffects() {
    const scrollBtn = document.getElementById('scrollTopBtn');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollBtn.classList.remove('translate-y-20', 'opacity-0');
            scrollBtn.classList.add('translate-y-0', 'opacity-100');
        } else {
            scrollBtn.classList.add('translate-y-20', 'opacity-0');
            scrollBtn.classList.remove('translate-y-0', 'opacity-100');
        }
    });
}

// ============================================
// CURRICULUM GRID (Landing Page)
// ============================================
function buildCurriculumGrid() {
    const grid = document.getElementById('curriculumGrid');
    if (!grid) return;
    
    const colors = [
        'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500',
        'from-purple-500 to-pink-500', 'from-amber-500 to-orange-500',
        'from-red-500 to-rose-500', 'from-teal-500 to-green-500',
        'from-indigo-500 to-blue-500', 'from-pink-500 to-red-500',
        'from-cyan-500 to-blue-500', 'from-emerald-500 to-teal-500',
        'from-violet-500 to-purple-500', 'from-orange-500 to-amber-500',
        'from-sky-500 to-indigo-500'
    ];
    
    grid.innerHTML = window.PLAYWRIGHT_MODULES.map((mod, i) => {
        const color = colors[i % colors.length];
        const sectionCount = mod.sections.length;
        const firstSection = mod.sections[0];
        
        return `
            <div onclick="navigateToSection('${mod.id}', '${firstSection.id}')" 
                class="group cursor-pointer p-5 rounded-xl bg-white dark:bg-surface-800 border border-gray-200 dark:border-gray-700/50 hover:border-transparent hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="flex items-start gap-3">
                    <span class="text-2xl">${mod.icon || '📘'}</span>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-bold text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-sm">${mod.title}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${sectionCount} sections</p>
                    </div>
                    <i class="fas fa-arrow-right text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all mt-1"></i>
                </div>
            </div>
        `;
    }).join('');
}
