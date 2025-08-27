/**
 * ChapterManager.js - Système modulaire pour les cours de mathématiques
 * Avec système de saisie mathématique intégré
 */

class ChapterManager {
    constructor() {
        this.currentChapter = null;
        this.completedExercises = 0;
        this.correctAnswers = 0;
        this.exerciseStates = new Map();
        this.mathInputSystem = null;
        this.config = {
            baseUrl: '/Systeme-pedago-html/MaW/data/',
            defaultChapter: 1
        };
        
        // Initialiser le système de saisie mathématique
        this.initMathInputSystem();
    }

    /**
     * Initialise le système de saisie mathématique
     */
    initMathInputSystem() {
        this.mathInputSystem = new MathInputSystem();
        this.createHelpModal();
    }

    /**
     * Crée la modale d'aide pour les instructions de saisie
     */
    createHelpModal() {
        const modal = document.createElement('div');
        modal.id = 'math-help-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="chapterManager.closeHelpModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>Instructions de saisie mathématique</h3>
                        <button class="modal-close" onclick="chapterManager.closeHelpModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="help-section">
                            <h4>Conversions automatiques :</h4>
                            <div class="conversion-grid">
                                <div class="conversion-item">
                                    <span class="input-example">*</span>
                                    <span class="arrow">→</span>
                                    <span class="output-example">×</span>
                                </div>
                                <div class="conversion-item">
                                    <span class="input-example">.</span>
                                    <span class="arrow">→</span>
                                    <span class="output-example">·</span>
                                </div>
                                <div class="conversion-item">
                                    <span class="input-example">/</span>
                                    <span class="arrow">→</span>
                                    <span class="output-example">÷</span>
                                </div>
                                <div class="conversion-item">
                                    <span class="input-example">-</span>
                                    <span class="arrow">→</span>
                                    <span class="output-example">−</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-section">
                            <h4>Exposants :</h4>
                            <div class="conversion-grid">
                                <div class="conversion-item">
                                    <span class="input-example">^2</span>
                                    <span class="arrow">→</span>
                                    <span class="output-example">²</span>
                                </div>
                                <div class="conversion-item">
                                    <span class="input-example">^3</span>
                                    <span class="arrow">→</span>
                                    <span class="output-example">³</span>
                                </div>
                                <div class="conversion-item">
                                    <span class="input-example">^4</span>
                                    <span class="arrow">→</span>
                                    <span class="output-example">⁴</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-section">
                            <h4>Fractions courantes :</h4>
                            <div class="conversion-grid">
                                <div class="conversion-item">
                                    <span class="input-example">1/2</span>
                                    <span class="arrow">→</span>
                                    <span class="output-example">½</span>
                                </div>
                                <div class="conversion-item">
                                    <span class="input-example">1/3</span>
                                    <span class="arrow">→</span>
                                    <span class="output-example">⅓</span>
                                </div>
                                <div class="conversion-item">
                                    <span class="input-example">2/3</span>
                                    <span class="arrow">→</span>
                                    <span class="output-example">⅔</span>
                                </div>
                                <div class="conversion-item">
                                    <span class="input-example">3/4</span>
                                    <span class="arrow">→</span>
                                    <span class="output-example">¾</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-section">
                            <h4>Constantes :</h4>
                            <div class="conversion-grid">
                                <div class="conversion-item">
                                    <span class="input-example">pi</span>
                                    <span class="arrow">→</span>
                                    <span class="output-example">π</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-section">
                            <h4>Utilisation :</h4>
                            <ul>
                                <li>Cliquez dans un champ de saisie pour voir la palette de symboles</li>
                                <li>Les conversions se font automatiquement pendant que vous tapez</li>
                                <li>Plusieurs formats sont acceptés : 2*3*5 = 2×3×5 = 2·3·5</li>
                                <li>Sur mobile, la palette apparaît en bas de l'écran</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Affiche la modale d'aide
     */
    showHelpModal() {
        document.getElementById('math-help-modal').style.display = 'flex';
    }

    /**
     * Ferme la modale d'aide
     */
    closeHelpModal() {
        document.getElementById('math-help-modal').style.display = 'none';
    }

    /**
     * Configure le gestionnaire de chapitres
     * @param {Object} config - Configuration
     */
    configure(config) {
        Object.assign(this.config, config);
    }

    /**
     * Charge un chapitre depuis un fichier JSON
     * @param {number|string} chapterIdentifier - Numéro du chapitre ou nom du fichier
     */
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

    /**
     * Valide la structure des données du chapitre
     * @param {Object} data - Données du chapitre
     */
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

    /**
     * Charge des données de fallback en cas d'erreur
     */
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

    /**
     * Initialise la page avec les données du chapitre
     * @param {Object} data - Données du chapitre
     */
    initializePage(data) {
        this.updatePageMetadata(data);
        this.generateNavigation(data.sections);
        this.generateContent(data);
        this.initializeEventListeners();
        this.mathInputSystem.reinitialize(); // Réinitialiser le système math après génération du contenu
    }

    /**
     * Met à jour les métadonnées de la page
     * @param {Object} data - Données du chapitre
     */
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

        // Citation
        const quoteElement = document.getElementById('chapter-quote');
        if (quoteElement && data.chapter.quote) {
            quoteElement.innerHTML = `"${data.chapter.quote.text}"<br><em>— ${data.chapter.quote.author}</em>`;
        }
    }

    /**
     * Génère la navigation
     * @param {Array} sections - Sections du chapitre
     */
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

    /**
     * Génère le contenu principal de la page
     * @param {Object} data - Données du chapitre
     */
    generateContent(data) {
        const content = document.getElementById('dynamic-content');
        if (!content) return;
        
        let contentHTML = '';
        
        // Générer les sections théoriques
        data.sections.forEach(section => {
            contentHTML += this.generateSection(section);
        });
        
        // Générer les exercices
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

    /**
     * Génère une section théorique
     * @param {Object} section - Données de la section
     */
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

    /**
     * Génère un élément théorique
     * @param {Object} item - Élément théorique
     */
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

    /**
     * Génère un tableau
     * @param {Object} tableData - Données du tableau
     */
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

    /**
     * Génère une liste ordonnée
     * @param {Object} listData - Données de la liste
     */
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

    /**
     * Génère une liste d'étapes
     * @param {Object} stepsData - Données des étapes
     */
    generateSteps(stepsData) {
        let html = `<div class="calculator-steps">
            <ol>`;
        
        stepsData.items.forEach(step => {
            html += `<li>${step}</li>`;
        });
        
        html += '</ol></div>';
        return html;
    }

    /**
     * Détecte le type d'exercice mathématique pour la palette de symboles
     * @param {Object} exercise - Données de l'exercice
     */
    detectMathType(exercise) {
        if (!exercise.questions) return 'basic';
        
        const allAnswers = exercise.questions.map(q => q.answer.toString()).join(' ');
        
        if (allAnswers.includes('²') || allAnswers.includes('³') || allAnswers.includes('π') || allAnswers.includes('½')) {
            return 'advanced';
        }
        if (allAnswers.includes('×') && allAnswers.includes('÷')) {
            return 'multiplication';
        }
        if (allAnswers.includes('÷')) {
            return 'simple';
        }
        if (allAnswers.includes('×') || allAnswers.includes('·')) {
            return 'multiplication';
        }
        
        return 'basic';
    }

    /**
     * Génère un exercice
     * @param {Object} exercise - Données de l'exercice
     */
    generateExercise(exercise) {
        const mathType = this.detectMathType(exercise);
        
        let html = `<div class="exercise">
            <div class="exercise-title">${exercise.icon} Exercice ${exercise.id}: ${exercise.title}</div>
            <div class="question">
                <div class="question-text">${exercise.description}</div>`;
        
        html += this.generateExerciseInputs(exercise, mathType);
        
        html += `
                <button class="btn btn-check" onclick="chapterManager.checkExercise(${exercise.id})">Vérifier</button>
                <button class="btn btn-solution" onclick="chapterManager.showSolution(${exercise.id})">Voir la solution</button>
                <button class="btn btn-reset" onclick="chapterManager.resetExercise(${exercise.id})">Reset</button>
                
                <div class="feedback" id="feedback${exercise.id}"></div>
            </div>
        </div>`;
        
        return html;
    }

    /**
     * Génère les inputs d'un exercice selon son type
     * @param {Object} exercise - Données de l'exercice
     * @param {string} mathType - Type mathématique détecté
     */
    generateExerciseInputs(exercise, mathType) {
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
                        <input type="${inputType}" class="answer-input math-input" id="${q.id}" 
                               placeholder="${q.placeholder || ''}" 
                               data-exercise-type="${mathType}"
                               ${inputType === 'number' ? 'step="any"' : ''}>
                    </div>`;
                });
                html += '</div>';
                break;
                
            case 'single_input':
                const q = exercise.questions[0];
                const inputType = q.type === 'number' ? 'number' : 'text';
                html += `<div>
                    <label><strong>${q.label}</strong></label>
                    <input type="${inputType}" class="answer-input math-input" id="${q.id}" 
                           placeholder="${q.placeholder || ''}" 
                           data-exercise-type="${mathType}"
                           style="width: 300px;" ${inputType === 'number' ? 'step="any"' : ''}>
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

    /**
     * Vérifie les réponses d'un exercice
     * @param {number} exerciseId - ID de l'exercice
     */
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
                    const userAnswer = document.getElementById(question.id).value.trim();
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
                        // Utiliser la comparaison flexible du système mathématique
                        if (this.mathInputSystem.compareAnswers(userAnswer, correctAnswer)) {
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

    /**
     * Met à jour l'état d'un exercice
     * @param {number} exerciseId - ID de l'exercice
     * @param {boolean} isCorrect - Si l'exercice est correct
     */
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

    /**
     * Affiche la solution d'un exercice
     * @param {number} exerciseId - ID de l'exercice
     */
    showSolution(exerciseId) {
        const exercise = this.currentChapter.exercises.find(ex => ex.id === exerciseId);
        if (!exercise || !exercise.solution) return;
        
        this.showFeedback(exerciseId, exercise.solution, 'solution');
    }

    /**
     * Remet à zéro un exercice
     * @param {number} exerciseId - ID de l'exercice
     */
    resetExercise(exerciseId) {
        const exercise = this.currentChapter.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;

        switch (exercise.type) {
            case 'grid_input':
            case 'single_input':
                exercise.questions.forEach(question => {
                    const element = document.getElementById(question.id);
                    if (element) {
                        element.value = '';
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

    /**
     * Affiche un feedback
     * @param {number} exerciseId - ID de l'exercice
     * @param {string} message - Message à afficher
     * @param {string} type - Type de feedback (correct, incorrect, solution)
     */
    showFeedback(exerciseId, message, type) {
        const feedback = document.getElementById(`feedback${exerciseId}`);
        if (feedback) {
            feedback.textContent = message;
            feedback.className = `feedback ${type}`;
            feedback.style.display = 'block';
        }
    }

    /**
     * Cache le feedback d'un exercice
     * @param {number} exerciseId - ID de l'exercice
     */
    resetFeedback(exerciseId) {
        const feedback = document.getElementById(`feedback${exerciseId}`);
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    /**
     * Met à jour les statistiques affichées
     */
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

    /**
     * Initialise les événements
     */
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

    /**
     * Change de chapitre
     * @param {number|string} chapterIdentifier - Identifiant du chapitre
     */
    switchChapter(chapterIdentifier) {
        this.resetState();
        return this.loadChapter(chapterIdentifier);
    }

    /**
     * Remet à zéro l'état du gestionnaire
     */
    resetState() {
        this.completedExercises = 0;
        this.correctAnswers = 0;
        this.exerciseStates.clear();
        this.currentChapter = null;
    }

    /**
     * Exporte l'état actuel pour sauvegarde
     */
    exportState() {
        return {
            currentChapter: this.currentChapter?.chapter?.number,
            completedExercises: this.completedExercises,
            correctAnswers: this.correctAnswers,
            exerciseStates: Object.fromEntries(this.exerciseStates)
        };
    }

    /**
     * Importe un état sauvegardé
     * @param {Object} state - État à importer
     */
    importState(state) {
        if (state.exerciseStates) {
            this.exerciseStates = new Map(Object.entries(state.exerciseStates));
        }
        this.completedExercises = state.completedExercises || 0;
        this.correctAnswers = state.correctAnswers || 0;
        this.updateStats();
    }
}

/**
 * Système de saisie mathématique intégré
 */
class MathInputSystem {
    constructor() {
        this.palette = null;
        this.activeInput = null;
        this.symbolSets = {
            basic: ['×', '÷', '+', '−'],
            multiplication: ['×', '·', '²', '³'],
            fractions: ['½', '⅓', '¼', '⅔', '¾', '⅘'],
            advanced: ['×', '÷', '²', '³', '⁴', 'π', '½', '⅓', '¼'],
            simple: ['÷', '×']
        };
        
        this.conversions = {
            '*': '×', '.': '·', '/': '÷', '-': '−',
            '^2': '²', '^3': '³', '^4': '⁴', '^5': '⁵',
            '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾',
            '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘', '1/6': '⅙', '5/6': '⅚',
            '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞',
            'pi': 'π', 'Pi': 'π', 'PI': 'π'
        };
        
        this.createPalette();
        this.init();
    }

    createPalette() {
        this.palette = document.createElement('div');
        this.palette.id = 'mathPalette';
        this.palette.className = 'math-palette';
        document.body.appendChild(this.palette);
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('focusin', (e) => {
            if (e.target.classList.contains('math-input')) {
                this.showPalette(e.target);
            }
        });
        
        document.addEventListener('focusout', (e) => {
            setTimeout(() => {
                if (!this.palette.contains(document.activeElement)) {
                    this.hidePalette();
                }
            }, 100);
        });
        
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('math-input')) {
                this.handleInput(e.target);
            }
        });
        
        this.palette.addEventListener('click', (e) => {
            if (e.target.classList.contains('symbol-btn')) {
                this.insertSymbol(e.target.textContent);
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.math-palette') && 
                !e.target.classList.contains('math-input')) {
                this.hidePalette();
            }
        });
    }
    
    showPalette(input) {
        this.activeInput = input;
        const exerciseType = input.dataset.exerciseType || 'basic';
        const symbols = this.symbolSets[exerciseType] || this.symbolSets.basic;
        
        this.createPaletteButtons(symbols);
        this.positionPalette(input);
        this.palette.classList.add('active');
    }
    
    hidePalette() {
        this.palette.classList.remove('active');
        this.activeInput = null;
    }
    
    createPaletteButtons(symbols) {
        this.palette.innerHTML = symbols
            .map(symbol => `<button class="symbol-btn" type="button">${symbol}</button>`)
            .join('');
    }
    
    positionPalette(input) {
        const rect = input.getBoundingClientRect();
        const paletteHeight = 60;
        
        if (window.innerWidth <= 768) {
            return;
        }
        
        let top = rect.bottom + 5;
        let left = rect.left;
        
        if (top + paletteHeight > window.innerHeight) {
            top = rect.top - paletteHeight - 5;
        }
        
        if (left + 300 > window.innerWidth) {
            left = window.innerWidth - 300 - 10;
        }
        
        this.palette.style.top = top + 'px';
        this.palette.style.left = Math.max(10, left) + 'px';
    }
    
    handleInput(input) {
        let value = input.value;
        let converted = value;
        
        const sortedConversions = Object.entries(this.conversions)
            .sort(([a], [b]) => b.length - a.length);
        
        for (const [from, to] of sortedConversions) {
            const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\        this.conversions = {
            '*': '×', '.': '·', '/': '÷', '-': '−',
            '^2': '²', '^3': '³', '^4': '⁴', '^5': ''), 'g');
            converted = converted.replace(regex, to);
        }
        
        if (converted !== value) {
            const selectionStart = input.selectionStart;
            input.value = converted;
            
            const lengthDiff = converted.length - value.length;
            input.setSelectionRange(
                selectionStart + lengthDiff, 
                selectionStart + lengthDiff
            );
        }
    }
    
    insertSymbol(symbol) {
        if (!this.activeInput) return;
        
        const start = this.activeInput.selectionStart;
        const end = this.activeInput.selectionEnd;
        const value = this.activeInput.value;
        
        this.activeInput.value = value.substring(0, start) + symbol + value.substring(end);
        this.activeInput.focus();
        this.activeInput.setSelectionRange(start + symbol.length, start + symbol.length);
    }
    
    normalizeAnswer(answer) {
        let normalized = answer.trim();
        
        const comparisonMap = {
            '×': '*', '·': '*', '÷': '/', '−': '-',
            '²': '^2', '³': '^3', '⁴': '^4',
            '½': '1/2', '⅓': '1/3', '⅔': '2/3', '¼': '1/4', '¾': '3/4',
            'π': 'pi'
        };
        
        for (const [from, to] of Object.entries(comparisonMap)) {
            normalized = normalized.replace(new RegExp(from, 'g'), to);
        }
        
        return normalized.toLowerCase().replace(/\s+/g, '');
    }
    
    compareAnswers(userAnswer, correctAnswer) {
        const userNorm = this.normalizeAnswer(userAnswer);
        const correctNorm = this.normalizeAnswer(correctAnswer);
        
        return userNorm === correctNorm;
    }

    reinitialize() {
        // Réinitialise les événements après génération du contenu
        setTimeout(() => {
            this.bindEvents();
        }, 100);
    }
}

// Instance globale du gestionnaire
const chapterManager = new ChapterManager();

// Initialisation automatique au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    chapterManager.loadChapter();
});
