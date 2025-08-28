class ChapterManager {
    constructor() {
        this.currentChapter = null;
        this.completedExercises = 0;
        this.correctAnswers = 0;
        this.exerciseStates = new Map();
        this.hybridMathSystem = null;
        this.config = {
            baseUrl: '/Systeme-pedago-html/MaW/data/',
            defaultChapter: 1
        };
        
        // Initialiser le système hybride
        this.initHybridMathSystem();
    }

initHybridMathSystem() {
    // Attendre que HybridMathInputSystem soit disponible
    if (typeof HybridMathInputSystem !== 'undefined') {
        this.hybridMathSystem = new HybridMathInputSystem();
        this.createHelpModal();
    } else {
        // Réessayer après un délai
        setTimeout(() => this.initHybridMathSystem(), 100);
    }
}

    createHelpModal() {
        const modal = document.createElement('div');
        modal.id = 'math-help-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="chapterManager.closeHelpModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>Guide de saisie mathématique</h3>
                        <button class="modal-close" onclick="chapterManager.closeHelpModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="help-section">
                            <h4>Système hybride :</h4>
                            <ul>
                                <li>Tapez "/" pour créer automatiquement des fractions</li>
                                <li>Cliquez dans un champ pour ouvrir la palette de symboles</li>
                                <li>La palette offre un accès direct aux symboles mathématiques</li>
                            </ul>
                        </div>
                        
                        <div class="help-section">
                            <h4>Conversion automatique :</h4>
                            <div class="conversion-grid">
                                <div class="conversion-item">
                                    <span class="input-example">3/4</span>
                                    <span class="arrow">→</span>
                                    <span class="output-example"><span class="fraction"><span class="numerator">3</span><span class="denominator">4</span></span></span>
                                </div>
                                <div class="conversion-item">
                                    <span class="input-example">2x+1/x-3</span>
                                    <span class="arrow">→</span>
                                    <span class="output-example"><span class="fraction"><span class="numerator">2x+1</span><span class="denominator">x-3</span></span></span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-section">
                            <h4>Palette principale :</h4>
                            <div class="conversion-grid">
                                <div class="conversion-item">
                                    <span class="output-example">+ − × ÷ ( ) π √</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-section">
                            <h4>Exposants (xⁿ) :</h4>
                            <div class="conversion-grid">
                                <div class="conversion-item">
                                    <span class="output-example">⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁿ ⁻</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-section">
                            <h4>Symboles avancés (⚙️) :</h4>
                            <div class="conversion-grid">
                                <div class="conversion-item">
                                    <span class="output-example">± ≤ ≥ ≠ ≈ ∞</span>
                                </div>
                                <div class="conversion-item">
                                    <span class="output-example">∑ ∫ ∂ α β γ δ θ λ μ σ ω</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-section">
                            <h4>Avantages :</h4>
                            <ul>
                                <li>Tapez rapidement "/" pour les fractions simples</li>
                                <li>Utilisez la palette pour les symboles complexes</li>
                                <li>Plus de conflits entre les conversions</li>
                                <li>Contrôle précis sur la saisie</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showHelpModal() {
        document.getElementById('math-help-modal').style.display = 'flex';
    }

    closeHelpModal() {
        document.getElementById('math-help-modal').style.display = 'none';
    }

    // Le reste des méthodes reste identique à votre version originale
    configure(config) {
        Object.assign(this.config, config);
    }

    async loadChapter(chapterIdentifier = null) {
        const identifier = chapterIdentifier || this.config.defaultChapter;
        const filename = typeof identifier === 'number' ? 
            `chapter${identifier}.json` : 
            identifier.endsWith('.json') ? identifier : `${identifier}.json`;
        
        try {
            const url = this.config.baseUrl + filename;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            this.validateChapterData(data);
            this.currentChapter = data;
            this.initializePage(data);
            return data;
            
        } catch (error) {
            console.warn(`Impossible de charger ${filename}:`, error.message);
            return this.loadFallbackData();
        }
    }

    validateChapterData(data) {
        const required = ['chapter', 'sections', 'exercises'];
        const missing = required.filter(key => !data[key]);
        
        if (missing.length > 0) {
            throw new Error(`Données manquantes: ${missing.join(', ')}`);
        }

        if (!data.chapter.title || !data.chapter.number) {
            throw new Error('Informations du chapitre incomplètes');
        }
    }

    loadFallbackData() {
        const fallbackData = {
            "chapter": {
                "number": "Demo",
                "title": "Chapitre de démonstration",
                "quote": {
                    "text": "Les mathématiques sont le langage avec lequel Dieu a écrit l'univers.",
                    "author": "Galilée"
                },
                "totalExercises": 1
            },
            "sections": [
                {
                    "id": "demo-section",
                    "title": "Section de démonstration",
                    "icon": "📚",
                    "theory": [
                        {
                            "type": "text",
                            "content": "Ceci est un chapitre de démonstration. Pour charger un vrai chapitre, assurez-vous que le fichier JSON correspondant est disponible."
                        }
                    ]
                }
            ],
            "exercises": [
                {
                    "id": 1,
                    "title": "Exercice de démonstration",
                    "icon": "🔍",
                    "type": "single_input",
                    "description": "Ceci est un exercice de test. Entrez 'demo' pour valider.",
                    "questions": [
                        { "label": "Réponse:", "id": "demo_answer", "answer": "demo" }
                    ],
                    "solution": "La réponse était 'demo'."
                }
            ]
        };
        
        this.currentChapter = fallbackData;
        this.initializePage(fallbackData);
        return fallbackData;
    }

    initializePage(data) {
        this.updatePageMetadata(data);
        this.generateNavigation(data.sections);
        this.generateContent(data);
        this.initializeEventListeners();
        // Réinitialiser le système mathématique hybride après génération du contenu
// Réinitialiser le système mathématique hybride après génération du contenu
if (this.hybridMathSystem) {
    this.hybridMathSystem.reinitialize();
}

    // Méthodes de génération identiques à votre version...
    updatePageMetadata(data) {
        document.title = `${data.chapter.title} - Cours Interactif`;
        
        const elements = {
            'page-title': `${data.chapter.title} - Cours Interactif`,
            'chapter-title': `📚 ${data.chapter.number} ${data.chapter.title}`,
            'totalExercises': data.chapter.totalExercises
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        const quoteElement = document.getElementById('chapter-quote');
        if (quoteElement && data.chapter.quote) {
            quoteElement.innerHTML = `"${data.chapter.quote.text}"<br><em>— ${data.chapter.quote.author}</em>`;
        }
    }

    generateNavigation(sections) {
        const nav = document.getElementById('navigation');
        if (!nav) return;
        
        let navHTML = '<button class="nav-btn help-btn" onclick="chapterManager.showHelpModal()">❓ Aide saisie</button>';
        sections.forEach(section => {
            navHTML += `<a href="#${section.id}" class="nav-btn">${section.icon} ${section.title}</a>`;
        });
        
        navHTML += `<a href="#exercices" class="nav-btn">📝 Exercices</a>`;
        nav.innerHTML = navHTML;
    }

    generateContent(data) {
        const content = document.getElementById('dynamic-content');
        if (!content) return;
        
        let contentHTML = '';
        
        data.sections.forEach(section => {
            contentHTML += this.generateSection(section);
        });
        
        if (data.exercises && data.exercises.length > 0) {
            contentHTML += '<div class="section" id="exercices">';
            contentHTML += '<h2 class="section-title">📝 Exercices</h2>';
            
            data.exercises.forEach(exercise => {
                contentHTML += this.generateExercise(exercise);
            });
            
            contentHTML += '</div>';
        }
        
        content.innerHTML = contentHTML;
    }

    // Les méthodes generateSection, generateTheoryItem, generateTable, etc. restent identiques...

    generateExercise(exercise) {
        let html = `<div class="exercise">
            <div class="exercise-title">${exercise.icon} Exercice ${exercise.id}: ${exercise.title}</div>
            <div class="question">
                <div class="question-text">${exercise.description}</div>`;
        
        html += this.generateExerciseInputs(exercise);
        
        html += `
                <button class="btn btn-check" onclick="chapterManager.checkExercise(${exercise.id})">Vérifier</button>
                <button class="btn btn-solution" onclick="chapterManager.showSolution(${exercise.id})">Voir la solution</button>
                <button class="btn btn-reset" onclick="chapterManager.resetExercise(${exercise.id})">Reset</button>
                
                <div class="feedback" id="feedback${exercise.id}"></div>
            </div>
        </div>`;
        
        return html;
    }

    generateExerciseInputs(exercise) {
        let html = '';
        
        switch (exercise.type) {
            case 'grid_input':
                html += '<div class="grid-answers">';
                const sortedQuestions = [...exercise.questions].sort((a, b) => {
                    const labelA = a.label.match(/^([a-z])\)/)?.[1] || '';
                    const labelB = b.label.match(/^([a-z])\)/)?.[1] || '';
                    return labelA.localeCompare(labelB);
                });
                
                sortedQuestions.forEach(q => {
                    const inputType = q.type === 'number' ? 'number' : 'text';
                    html += `<div>
                        <label><strong>${q.label}</strong></label>
                        <div contenteditable="true" class="answer-input math-input" id="${q.id}" 
                             data-placeholder="${q.placeholder || ''}" 
                             data-input-type="${inputType}"></div>
                    </div>`;
                });
                html += '</div>';
                break;
                
            case 'single_input':
                const q = exercise.questions[0];
                const inputType = q.type === 'number' ? 'number' : 'text';
                html += `<div>
                    <label><strong>${q.label}</strong></label>
                    <div contenteditable="true" class="answer-input math-input" id="${q.id}" 
                         data-placeholder="${q.placeholder || ''}" 
                         data-input-type="${inputType}"></div>
                </div>`;
                break;
                
            case 'textarea':
                html += `<textarea class="answer-input" id="ex${exercise.id}_text" 
                    placeholder="${exercise.hint || ''}" 
                    style="width: 100%; height: 120px; resize: vertical;"></textarea>`;
                break;
        }
        
        return html;
    }

    checkExercise(exerciseId) {
        const exercise = this.currentChapter.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;

        let isCorrect = false;
        let feedback = '';
        let correctCount = 0;
        let totalQuestions = 0;

        switch (exercise.type) {
            case 'grid_input':
            case 'single_input':
                totalQuestions = exercise.questions.length;
                
                exercise.questions.forEach(question => {
                    const element = document.getElementById(question.id);
                    const userAnswer = (element.textContent || element.innerText || '').trim();
                    const correctAnswer = question.answer.toString().trim();
                    const inputElement = document.getElementById(question.id);
                    
                    let isQuestionCorrect = false;
                    
                    if (question.type === 'number') {
                        const userNum = parseFloat(userAnswer);
                        const correctNum = parseFloat(correctAnswer);
                        if (!isNaN(userNum) && Math.abs(userNum - correctNum) < 0.001) {
                            correctCount++;
                            isQuestionCorrect = true;
                        }
                    } else {
                        // Utiliser la comparaison flexible du système hybride
                        if (this.hybridMathSystem.compareAnswers(userAnswer, correctAnswer)) {
                            correctCount++;
                            isQuestionCorrect = true;
                        }
                    }
                    
                    inputElement.classList.remove('correct', 'incorrect');
                    inputElement.classList.add(isQuestionCorrect ? 'correct' : 'incorrect');
                });
                
                isCorrect = correctCount === totalQuestions;
                feedback = totalQuestions === 1 ? 
                    (isCorrect ? 'Correct !' : 'Incorrect.') :
                    `${correctCount}/${totalQuestions} réponses correctes`;
                break;
                
            case 'textarea':
                const userText = document.getElementById(`ex${exerciseId}_text`).value.trim();
                const minLength = exercise.minLength || 20;
                isCorrect = userText.length >= minLength;
                feedback = isCorrect ? 
                    'Explication fournie ! Consultez la solution pour comparer.' : 
                    `Veuillez fournir une explication plus détaillée (minimum ${minLength} caractères).`;
                break;
        }

        this.showFeedback(exerciseId, feedback, isCorrect ? 'correct' : 'incorrect');
        this.updateExerciseState(exerciseId, isCorrect);
        this.updateStats();
    }

    updateExerciseState(exerciseId, isCorrect) {
        const wasCompleted = this.exerciseStates.has(exerciseId);
        const wasCorrect = this.exerciseStates.get(exerciseId);
        
        if (!wasCompleted) {
            this.completedExercises++;
            if (isCorrect) this.correctAnswers++;
        } else if (wasCorrect !== isCorrect) {
            this.correctAnswers += isCorrect ? 1 : -1;
        }
        
        this.exerciseStates.set(exerciseId, isCorrect);
    }

    showSolution(exerciseId) {
        const exercise = this.currentChapter.exercises.find(ex => ex.id === exerciseId);
        if (!exercise || !exercise.solution) return;
        
        this.showFeedback(exerciseId, exercise.solution, 'solution');
    }

    resetExercise(exerciseId) {
        const exercise = this.currentChapter.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;

        switch (exercise.type) {
            case 'grid_input':
            case 'single_input':
                exercise.questions.forEach(question => {
                    const element = document.getElementById(question.id);
                    if (element) {
                        element.innerHTML = '';
                        element.classList.remove('correct', 'incorrect');
                    }
                });
                break;
                
            case 'textarea':
                const element = document.getElementById(`ex${exerciseId}_text`);
                if (element) {
                    element.value = '';
                    element.classList.remove('correct', 'incorrect');
                }
                break;
        }
        
        this.resetFeedback(exerciseId);
    }

    showFeedback(exerciseId, message, type) {
        const feedback = document.getElementById(`feedback${exerciseId}`);
        if (feedback) {
            feedback.textContent = message;
            feedback.className = `feedback ${type}`;
            feedback.style.display = 'block';
        }
    }

    resetFeedback(exerciseId) {
        const feedback = document.getElementById(`feedback${exerciseId}`);
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    updateStats() {
        const elements = {
            'completedExercises': this.completedExercises,
            'correctAnswers': this.correctAnswers
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        const totalExercises = this.currentChapter?.chapter?.totalExercises || 1;
        const progress = (this.completedExercises / totalExercises) * 100;
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
    }

    initializeEventListeners() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (!btn.classList.contains('help-btn')) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            }
        });
    }

    switchChapter(chapterIdentifier) {
        this.resetState();
        return this.loadChapter(chapterIdentifier);
    }

    resetState() {
        this.completedExercises = 0;
        this.correctAnswers = 0;
        this.exerciseStates.clear();
        this.currentChapter = null;
    }

    exportState() {
        return {
            currentChapter: this.currentChapter?.chapter?.number,
            completedExercises: this.completedExercises,
            correctAnswers: this.correctAnswers,
            exerciseStates: Object.fromEntries(this.exerciseStates)
        };
    }

    importState(state) {
        if (state.exerciseStates) {
            this.exerciseStates = new Map(Object.entries(state.exerciseStates));
        }
        this.completedExercises = state.completedExercises || 0;
        this.correctAnswers = state.correctAnswers || 0;
        this.updateStats();
    }

    // Méthodes manquantes pour la génération complète
    generateSection(section) {
        let html = `<div class="section" id="${section.id}">`;
        html += `<h2 class="section-title">${section.title}</h2>`;
        
        if (section.theory) {
            section.theory.forEach(item => {
                html += this.generateTheoryItem(item);
            });
        }
        
        if (section.examples) {
            section.examples.forEach(example => {
                html += `<div class="example-box">
                    <div class="example-title">${example.title}</div>
                    <p>${example.content}</p>
                </div>`;
            });
        }
        
        if (section.subsections) {
            section.subsections.forEach(subsection => {
                html += `<div class="subsection-title">${subsection.title}</div>`;
                if (subsection.content) {
                    subsection.content.forEach(item => {
                        html += this.generateTheoryItem(item);
                    });
                }
            });
        }
        
        html += '</div>';
        return html;
    }

    generateTheoryItem(item) {
        switch (item.type) {
            case 'text':
                return `<div class="theory-box"><p>${item.content}</p></div>`;
            
            case 'table':
                return this.generateTable(item);
            
            case 'ordered_list':
                return this.generateOrderedList(item);
            
            case 'steps':
                return this.generateSteps(item);
            
            default:
                return `<div class="theory-box"><p>${item.content || ''}</p></div>`;
        }
    }

    generateTable(tableData) {
        let html = `<div class="theory-box">
            <table class="divisibility-table">
                <thead><tr>`;
        
        tableData.headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        
        html += `</tr></thead><tbody>`;
        
        tableData.data.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td><strong>${cell.split(':')[0] || cell}</strong>${cell.includes(':') ? '</td><td>' + cell.split(':').slice(1).join(':') : ''}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        return html;
    }

    generateOrderedList(listData) {
        let html = `<div class="priority-list">
            <h3>${listData.title}</h3>
            <ol>`;
        
        listData.items.forEach(item => {
            html += `<li><strong>${item}</strong></li>`;
        });
        
        html += '</ol></div>';
        return html;
    }

    generateSteps(stepsData) {
        let html = `<div class="calculator-steps">
            <ol>`;
        
        stepsData.items.forEach(step => {
            html += `<li>${step}</li>`;
        });
        
        html += '</ol></div>';
        return html;
    }
}
