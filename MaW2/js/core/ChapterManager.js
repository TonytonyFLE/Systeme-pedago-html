class ChapterManager {
constructor() {
    this.currentChapter = null;
    this.completedExercises = 0;
    this.correctAnswers = 0;
    this.exerciseStates = new Map();
    this.hybridMathSystem = null;
    this.mathValidator = null; // Changé : ne plus instancier immédiatement
    
    this.config = {
        baseUrl: 'data/',
        defaultChapter: 1
    };
    
    // Initialiser le système hybride
    this.initHybridMathSystem();
}

initHybridMathSystem() {
    // Attendre que les deux classes soient disponibles
    if (typeof HybridMathInputSystem !== 'undefined' && typeof MathValidator !== 'undefined') {
        this.hybridMathSystem = new HybridMathInputSystem();
        this.mathValidator = new MathValidator(); // Déplacé ici
        this.createHelpModal();
    } else {
        // Réessayer après un délai
        setTimeout(() => this.initHybridMathSystem(), 100);
    }
}

    createHelpModal() {
        const modal = document.createElement('div');
        modal.id = 'math-help-modal';
        
        // Créer la structure du modal de manière sécurisée
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.onclick = () => this.closeHelpModal();
        
        const content = document.createElement('div');
        content.className = 'modal-content';
        content.onclick = (e) => e.stopPropagation();
        
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const title = document.createElement('h3');
        title.textContent = 'Guide de saisie mathématique';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.textContent = '×';
        closeBtn.onclick = () => this.closeHelpModal();
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        const body = document.createElement('div');
        body.className = 'modal-body';
        
        // Contenu du modal (sécurisé)
        body.innerHTML = `
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
        `;
        
        content.appendChild(header);
        content.appendChild(body);
        overlay.appendChild(content);
        modal.appendChild(overlay);
        
        document.body.appendChild(modal);
    }

    showHelpModal() {
        document.getElementById('math-help-modal').style.display = 'flex';
    }

    closeHelpModal() {
        document.getElementById('math-help-modal').style.display = 'none';
    }

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

        // Validation avancée : vérifier l'unicité des IDs
        const exerciseIds = new Set();
        data.exercises.forEach(exercise => {
            if (exercise.questions) {
                exercise.questions.forEach(question => {
                    if (exerciseIds.has(question.id)) {
                        console.warn(`ID dupliqué détecté: ${question.id}`);
                    }
                    exerciseIds.add(question.id);
                });
            }
        });

        // Vérifier la cohérence du nombre d'exercices
        if (data.chapter.totalExercises !== data.exercises.length) {
            console.warn(`Incohérence: totalExercises=${data.chapter.totalExercises}, mais ${data.exercises.length} exercices trouvés`);
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
        
        // Détruire l'ancien système et en créer un nouveau
        if (this.hybridMathSystem) {
            this.hybridMathSystem.destroy();
        }
        this.hybridMathSystem = new HybridMathInputSystem();
    }

    // SÉCURISÉ : Utilisation de textContent au lieu d'innerHTML pour les données JSON
    updatePageMetadata(data) {
        document.title = DOMSanitizer.sanitizeText(`${data.chapter.title} - Cours Interactif`);
        
        const elements = {
            'page-title': `${data.chapter.title} - Cours Interactif`,
            'chapter-title': `📚 ${data.chapter.number} ${data.chapter.title}`,
            'totalExercises': data.chapter.totalExercises
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // SÉCURISÉ : Création sécurisée de la citation
        const quoteElement = document.getElementById('chapter-quote');
        if (quoteElement && data.chapter.quote) {
            // Vérifier que le contenu est sûr
            if (DOMSanitizer.isTextSafe(data.chapter.quote.text) && 
                DOMSanitizer.isTextSafe(data.chapter.quote.author)) {
                
                const quoteText = DOMSanitizer.createTextElement('span', `"${data.chapter.quote.text}"`);
                const lineBreak = document.createElement('br');
                const author = DOMSanitizer.createTextElement('em', `— ${data.chapter.quote.author}`);
                
                quoteElement.innerHTML = '';
                quoteElement.appendChild(quoteText);
                quoteElement.appendChild(lineBreak);
                quoteElement.appendChild(author);
            } else {
                quoteElement.textContent = 'Citation non disponible (contenu non sécurisé)';
            }
        }
    }

    generateNavigation(sections) {
        const nav = document.getElementById('navigation');
        if (!nav) return;
        
        // Créer le bouton d'aide de manière sécurisée
        const helpBtn = document.createElement('button');
        helpBtn.className = 'nav-btn help-btn';
        helpBtn.textContent = '❓ Aide saisie';
        helpBtn.onclick = () => this.showHelpModal();
        
        nav.innerHTML = '';
        nav.appendChild(helpBtn);
        
        // Ajouter les liens de navigation
        sections.forEach(section => {
            const link = document.createElement('a');
            link.href = `#${section.id}`;
            link.className = 'nav-btn';
            link.textContent = `${section.icon} ${DOMSanitizer.sanitizeText(section.title)}`;
            nav.appendChild(link);
        });
        
        // Lien vers les exercices
        const exerciseLink = document.createElement('a');
        exerciseLink.href = '#exercices';
        exerciseLink.className = 'nav-btn';
        exerciseLink.textContent = '📝 Exercices';
        nav.appendChild(exerciseLink);
    }

    generateContent(data) {
        const content = document.getElementById('dynamic-content');
        if (!content) return;
        
        content.innerHTML = '';
        
        data.sections.forEach(section => {
            const sectionElement = this.generateSectionElement(section);
            content.appendChild(sectionElement);
        });
        
        if (data.exercises && data.exercises.length > 0) {
            const exerciseSection = document.createElement('div');
            exerciseSection.className = 'section';
            exerciseSection.id = 'exercices';
            
            const title = document.createElement('h2');
            title.className = 'section-title';
            title.textContent = '📝 Exercices';
            exerciseSection.appendChild(title);
            
            data.exercises.forEach(exercise => {
                const exerciseElement = this.generateExerciseElement(exercise);
                exerciseSection.appendChild(exerciseElement);
            });
            
            content.appendChild(exerciseSection);
        }
    }

    generateSectionElement(section) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section';
        sectionDiv.id = section.id;
        
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = DOMSanitizer.sanitizeText(section.title);
        sectionDiv.appendChild(title);
        
        if (section.theory) {
            section.theory.forEach(item => {
                const theoryElement = this.generateTheoryElement(item);
                sectionDiv.appendChild(theoryElement);
            });
        }
        
        if (section.examples) {
            section.examples.forEach(example => {
                const exampleDiv = document.createElement('div');
                exampleDiv.className = 'example-box';
                
                const exampleTitle = document.createElement('div');
                exampleTitle.className = 'example-title';
                exampleTitle.textContent = DOMSanitizer.sanitizeText(example.title);
                
                const exampleContent = document.createElement('p');
                exampleContent.textContent = DOMSanitizer.sanitizeText(example.content);
                
                exampleDiv.appendChild(exampleTitle);
                exampleDiv.appendChild(exampleContent);
                sectionDiv.appendChild(exampleDiv);
            });
        }
        
        if (section.subsections) {
            section.subsections.forEach(subsection => {
                const subsectionTitle = document.createElement('div');
                subsectionTitle.className = 'subsection-title';
                subsectionTitle.textContent = DOMSanitizer.sanitizeText(subsection.title);
                sectionDiv.appendChild(subsectionTitle);
                
                if (subsection.content) {
                    subsection.content.forEach(item => {
                        const contentElement = this.generateTheoryElement(item);
                        sectionDiv.appendChild(contentElement);
                    });
                }
            });
        }
        
        return sectionDiv;
    }

    generateTheoryElement(item) {
        switch (item.type) {
            case 'text':
                const textDiv = document.createElement('div');
                textDiv.className = 'theory-box';
                const p = document.createElement('p');
                p.textContent = DOMSanitizer.sanitizeText(item.content);
                textDiv.appendChild(p);
                return textDiv;
            
            case 'table':
                return this.generateTableElement(item);
            
            case 'ordered_list':
                return this.generateOrderedListElement(item);
            
            case 'steps':
                return this.generateStepsElement(item);
            
            default:
                const defaultDiv = document.createElement('div');
                defaultDiv.className = 'theory-box';
                const defaultP = document.createElement('p');
                defaultP.textContent = DOMSanitizer.sanitizeText(item.content || '');
                defaultDiv.appendChild(defaultP);
                return defaultDiv;
        }
    }

    generateTableElement(tableData) {
        const container = document.createElement('div');
        container.className = 'theory-box';
        
        const table = document.createElement('table');
        table.className = 'divisibility-table';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        tableData.headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = DOMSanitizer.sanitizeText(header);
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        
        tableData.data.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                const cellParts = cell.split(':');
                const strong = document.createElement('strong');
                strong.textContent = DOMSanitizer.sanitizeText(cellParts[0] || cell);
                td.appendChild(strong);
                
                if (cellParts.length > 1) {
                    const additionalTd = document.createElement('td');
                    additionalTd.textContent = DOMSanitizer.sanitizeText(cellParts.slice(1).join(':'));
                    tr.appendChild(td);
                    tr.appendChild(additionalTd);
                } else {
                    tr.appendChild(td);
                }
            });
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        container.appendChild(table);
        return container;
    }

    generateOrderedListElement(listData) {
        const container = document.createElement('div');
        container.className = 'priority-list';
        
        const title = document.createElement('h3');
        title.textContent = DOMSanitizer.sanitizeText(listData.title);
        container.appendChild(title);
        
        const ol = document.createElement('ol');
        
        listData.items.forEach(item => {
            const li = document.createElement('li');
            const strong = document.createElement('strong');
            strong.textContent = DOMSanitizer.sanitizeText(item);
            li.appendChild(strong);
            ol.appendChild(li);
        });
        
        container.appendChild(ol);
        return container;
    }

    generateStepsElement(stepsData) {
        const container = document.createElement('div');
        container.className = 'calculator-steps';
        
        const ol = document.createElement('ol');
        
        stepsData.items.forEach(step => {
            const li = document.createElement('li');
            li.textContent = DOMSanitizer.sanitizeText(step);
            ol.appendChild(li);
        });
        
        container.appendChild(ol);
        return container;
    }

    generateExerciseElement(exercise) {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'exercise';
        
        const title = document.createElement('div');
        title.className = 'exercise-title';
        title.textContent = `${exercise.icon} Exercice ${exercise.id}: ${DOMSanitizer.sanitizeText(exercise.title)}`;
        
        const question = document.createElement('div');
        question.className = 'question';
        
        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        questionText.textContent = DOMSanitizer.sanitizeText(exercise.description);
        
        exerciseDiv.appendChild(title);
        question.appendChild(questionText);
        
        const inputsContainer = this.generateExerciseInputsElement(exercise);
        question.appendChild(inputsContainer);
        
        // Boutons
        const checkBtn = document.createElement('button');
        checkBtn.className = 'btn btn-check';
        checkBtn.textContent = 'Vérifier';
        checkBtn.onclick = () => this.checkExercise(exercise.id);
        
        const solutionBtn = document.createElement('button');
        solutionBtn.className = 'btn btn-solution';
        solutionBtn.textContent = 'Voir la solution';
        solutionBtn.onclick = () => this.showSolution(exercise.id);
        
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn btn-reset';
        resetBtn.textContent = 'Reset';
        resetBtn.onclick = () => this.resetExercise(exercise.id);
        
        const feedback = document.createElement('div');
        feedback.className = 'feedback';
        feedback.id = `feedback${exercise.id}`;
        
        question.appendChild(checkBtn);
        question.appendChild(solutionBtn);
        question.appendChild(resetBtn);
        question.appendChild(feedback);
        
        exerciseDiv.appendChild(question);
        return exerciseDiv;
    }

    generateExerciseInputsElement(exercise) {
        const container = document.createElement('div');
        
        switch (exercise.type) {
            case 'grid_input':
                container.className = 'grid-answers';
                const sortedQuestions = [...exercise.questions].sort((a, b) => {
                    const labelA = a.label.match(/^([a-z])\)/)?.[1] || '';
                    const labelB = b.label.match(/^([a-z])\)/)?.[1] || '';
                    return labelA.localeCompare(labelB);
                });
                
                sortedQuestions.forEach(q => {
                    const div = document.createElement('div');
                    
                    const label = document.createElement('label');
                    label.setAttribute('for', q.id);
                    const strong = document.createElement('strong');
                    strong.textContent = DOMSanitizer.sanitizeText(q.label);
                    label.appendChild(strong);
                    
                    const input = document.createElement('div');
                    input.contentEditable = true;
                    input.className = 'answer-input math-input';
                    input.id = q.id;
                    input.setAttribute('role', 'textbox');
                    input.setAttribute('aria-label', `Réponse pour ${q.label}`);
                    input.setAttribute('data-placeholder', q.placeholder || '');
                    input.setAttribute('data-input-type', q.type === 'number' ? 'number' : 'text');
                    
                    div.appendChild(label);
                    div.appendChild(input);
                    container.appendChild(div);
                });
                break;
            
            case 'single_input':
                const q = exercise.questions[0];
                
                const label = document.createElement('label');
                label.setAttribute('for', q.id);
                const strong = document.createElement('strong');
                strong.textContent = DOMSanitizer.sanitizeText(q.label);
                label.appendChild(strong);
                
                const input = document.createElement('div');
                input.contentEditable = true;
                input.className = 'answer-input math-input';
                input.id = q.id;
                input.setAttribute('role', 'textbox');
                input.setAttribute('aria-label', `Réponse pour ${q.label}`);
                input.setAttribute('data-placeholder', q.placeholder || '');
                input.setAttribute('data-input-type', q.type === 'number' ? 'number' : 'text');
                
                container.appendChild(label);
                container.appendChild(input);
                break;
            
            case 'textarea':
                const textarea = document.createElement('textarea');
                textarea.className = 'answer-input';
                textarea.id = `ex${exercise.id}_text`;
                textarea.placeholder = DOMSanitizer.sanitizeText(exercise.hint || '');
                textarea.style.width = '100%';
                textarea.style.height = '120px';
                textarea.style.resize = 'vertical';
                textarea.setAttribute('aria-label', 'Réponse détaillée');
                
                container.appendChild(textarea);
                break;
        }
        
        return container;
    }

    checkExercise(exerciseId) {
        const exercise = this.currentChapter.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;

         // AJOUTEZ CETTE VÉRIFICATION ICI
    if (!this.mathValidator) {
        console.warn('MathValidator pas encore initialisé');
        return;
    }
        
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
                        // DEBUG : affichera dans la console pourquoi ça passe/échoue
                        this.mathValidator.debugComparison(userAnswer, correctAnswer);

                        // Utiliser désormais le validateur mathématique avancé
                        if (this.mathValidator.compareAnswers(userAnswer, correctAnswer)) {
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
        
        this.showFeedback(exerciseId, DOMSanitizer.sanitizeText(exercise.solution), 'solution');
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
            feedback.textContent = DOMSanitizer.sanitizeText(message);
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
        
        // Nettoyer le système mathématique
        if (this.hybridMathSystem) {
            this.hybridMathSystem.destroy();
            this.hybridMathSystem = null;
        }
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
}
