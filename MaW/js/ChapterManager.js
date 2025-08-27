/**
 * ChapterManager.js - Système modulaire pour les cours de mathématiques
 * Permet de charger dynamiquement différents chapitres depuis des fichiers JSON
 */

class ChapterManager {
    constructor() {
        this.currentChapter = null;
        this.completedExercises = 0;
        this.correctAnswers = 0;
        this.exerciseStates = new Map(); // Stocke l'état de chaque exercice
        this.config = {
            baseUrl: '/Systeme-pedago-html/MaW/data/',
            defaultChapter: 1
        };
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
        
        let navHTML = '';
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
     * Génère un exercice
     * @param {Object} exercise - Données de l'exercice
     */
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

    /**
     * Génère les inputs d'un exercice selon son type
     * @param {Object} exercise - Données de l'exercice
     */
    generateExerciseInputs(exercise) {
        let html = '';
        
        switch (exercise.type) {
            case 'grid_input':
                html += '<div class="grid-answers">';
                exercise.questions.forEach(q => {
                    const inputType = q.type === 'number' ? 'number' : 'text';
                    html += `<div>
                        <label><strong>${q.label}</strong></label>
                        <input type="${inputType}" class="answer-input" id="${q.id}" 
                               placeholder="${q.placeholder || ''}" ${inputType === 'number' ? 'step="any"' : ''}>
                    </div>`;
                });
                html += '</div>';
                break;
                
            case 'single_input':
                const q = exercise.questions[0];
                const inputType = q.type === 'number' ? 'number' : 'text';
                html += `<div>
                    <label><strong>${q.label}</strong></label>
                    <input type="${inputType}" class="answer-input" id="${q.id}" 
                           placeholder="${q.placeholder || ''}" style="width: 300px;" ${inputType === 'number' ? 'step="any"' : ''}>
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
        // Gestion flexible des réponses textuelles
        if (this.compareTextAnswers(userAnswer, correctAnswer)) {
            correctCount++;
            isQuestionCorrect = true;
        }
    }
    
    // Ajouter la classe visuelle
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
     * Compare deux réponses textuelles de manière flexible
     * @param {string} userAnswer - Réponse de l'utilisateur
     * @param {string} correctAnswer - Réponse correcte
     */
    compareTextAnswers(userAnswer, correctAnswer) {
        const normalize = (str) => str.toLowerCase()
            .replace(/\s/g, '')
            .replace(/[,;]/g, ',')
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .sort()
            .join(',');
        
        const userNormalized = normalize(userAnswer);
        const correctNormalized = normalize(correctAnswer);
        
        // Cas spéciaux
        if (correctAnswer === 'aucun' && (userAnswer === '' || userAnswer.toLowerCase() === 'aucun')) {
            return true;
        }
        
        return userNormalized === correctNormalized;
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

    // Réinitialiser les champs de saisie
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

        // Mise à jour de la barre de progression
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
        // Navigation fluide
        document.querySelectorAll('.nav-btn').forEach(btn => {
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

// Instance globale du gestionnaire
const chapterManager = new ChapterManager();

// Initialisation automatique au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    chapterManager.loadChapter();
});
