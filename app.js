// Application State
let appState = {
    currentRound: 1,
    studentResponses: [],
    studentProgress: {
        professionalism: 20,
        punctuality: 30,
        engagement: 25,
        documentation: 20,
        collaboration: 25
    },
    feedbackHistory: [],
    bestPracticeScore: 0,
    totalSelections: 0,
    remainingIssues: {
        1: ['Defensive reactions to feedback', 'Limited progress on documentation', 'Inconsistent professionalism'],
        2: ['Continued struggles with time management', 'Documentation still needs improvement', 'Occasional defensiveness persists'],
        3: ['Slow progress on self-awareness', 'Needs more initiative on seeking help', 'Professionalism improving but inconsistent']
    }
};

// Feedback options database - ranked by quality
const feedbackOptions = [
    {
        rank: 1,
        quality: 'best',
        text: 'I\'ve noticed you were 20 minutes late to rounds today, and you weren\'t in professional attire. I want to understand what\'s happening. Can you help me understand what\'s going on? I\'m here to support you, and I\'d like to work together to find solutions that work for both of us. What do you think we can do?',
        strengths: ['Specific concrete examples', 'Uses I-statements', 'Asks open-ended question', 'Offers support and collaboration'],
        quality_text: 'Excellent - Best practices aligned',
        studentResponse: 'Thank you for the feedback. I can see your point about my punctuality. I\'ve been struggling with the commute, but that\'s not an excuse. I appreciate you asking rather than just telling me what to do. I\'d like to find a solution.',
        score: 1.0
    },
    {
        rank: 2,
        quality: 'good',
        text: 'I\'ve observed that you were late to rounds again today and you weren\'t dressed professionally. This affects how the team perceives your commitment. I think you have potential, but these things need to change. What support do you need from me to make improvements?',
        strengths: ['Specific examples provided', 'Acknowledges potential (balance)', 'Offers support'],
        opportunities: ['Could ask open-ended question first'],
        quality_text: 'Good - Several best practices present',
        studentResponse: 'I hear what you\'re saying. I realize I\'ve been struggling with these issues. I appreciate the offer of support. I think some training on time management would help.',
        score: 0.75
    },
    {
        rank: 3,
        quality: 'fair',
        text: 'You need to be more professional and on time. This rotation is important and you\'re not making a good impression. You\'re always late and your appearance is unprofessional. You need to step it up.',
        opportunities: ['Lacks specific examples', 'Uses absolute language (always)', 'No collaboration or support offered', 'Judgmental tone'],
        quality_text: 'Fair - Limited best practices',
        studentResponse: 'I understand. I\'ll try harder. But I feel like you\'re being really hard on me. I\'m doing my best given everything I\'m juggling.',
        score: 0.4
    },
    {
        rank: 4,
        quality: 'poor',
        text: 'You\'re unprofessional and unreliable. This is unacceptable behavior. If this continues, you\'re going to have serious problems. Get your act together.',
        opportunities: ['Very judgmental and accusatory', 'No specific examples', 'Threatens rather than supports', 'No collaboration or problem-solving'],
        quality_text: 'Poor - Counterproductive',
        studentResponse: 'This feels unfair. You\'re being really harsh. I don\'t think this is constructive feedback. I\'m a good resident and I don\'t appreciate being talked to this way.',
        score: 0.0
    }
];

// Screen Navigation
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('screen-active');
    });
    document.getElementById(screenId).classList.add('screen-active');
    window.scrollTo(0, 0);
}

function showStudentProfile() {
    switchScreen('profile-screen');
}

function showFeedbackScreen() {
    switchScreen('feedback-screen');
    generateFeedbackOptions();
}

// Generate and display feedback option cards
function generateFeedbackOptions() {
    const optionsContainer = document.getElementById('feedback-options');
    optionsContainer.innerHTML = '';
    
    feedbackOptions.forEach((option, index) => {
        const optionCard = document.createElement('div');
        optionCard.className = 'feedback-option';
        optionCard.setAttribute('data-index', index);
        optionCard.onclick = () => selectFeedbackOption(index);
        
        let opportunitiesHtml = '';
        if (option.opportunities && option.opportunities.length > 0) {
            opportunitiesHtml = `<div style="margin-top: 0.5rem; font-size: 0.85rem; color: #e67e22;">${option.opportunities.join(' • ')}</div>`;
        }
        
        optionCard.innerHTML = `
            <div class="option-header">
                <span class="option-rank rank-${option.rank}">Option ${option.rank}</span>
            </div>
            <div class="feedback-option-text">${option.text}</div>
            ${option.strengths ? `<div class="option-quality-indicator ${option.quality}">✓ ${option.strengths.join(' • ')}</div>` : ''}
            ${opportunitiesHtml}
        `;
        
        optionsContainer.appendChild(optionCard);
    });
}

function selectFeedbackOption(index) {
    const selectedOption = feedbackOptions[index];
    const responsePanel = document.getElementById('feedback-response-panel');
    const responseContent = document.getElementById('response-content');
    
    // Mark all options
    document.querySelectorAll('.feedback-option').forEach((option, i) => {
        option.classList.remove('selected');
        if (i === index) {
            option.classList.add('selected');
        }
    });
    
    // Show response feedback
    const scoreColor = selectedOption.quality === 'best' ? 'best' : 
                      selectedOption.quality === 'good' ? 'good' : 
                      selectedOption.quality === 'fair' ? 'fair' : 'poor';
    
    responseContent.innerHTML = `
        <div class="response-title ${scoreColor}">
            ${selectedOption.quality === 'best' ? '✓ Excellent Choice!' : 
              selectedOption.quality === 'good' ? '✓ Good Approach' : 
              selectedOption.quality === 'fair' ? '△ Fair Approach' : '✗ Less Effective'}
        </div>
        <div class="response-message">
            <p><strong>Quality Assessment:</strong> ${selectedOption.quality_text}</p>
        </div>
    `;
    
    responsePanel.classList.remove('hidden');
    
    // Store and process the selection
    setTimeout(() => {
        processFeedbackSelection(selectedOption, index);
    }, 500);
}

function processFeedbackSelection(option, index) {
    appState.feedbackHistory.push({
        round: appState.currentRound,
        feedback: option.text,
        quality: option.quality,
        rank: option.rank
    });
    
    // Update scores
    appState.totalSelections += 1;
    if (option.quality === 'best') {
        appState.bestPracticeScore += 1;
    }
    
    // Add to history log
    const historyLog = document.getElementById('history-log');
    const facultyItem = document.createElement('div');
    facultyItem.className = 'history-item';
    facultyItem.innerHTML = `<span class="history-label">You:</span> Selected Option ${option.rank}`;
    historyLog.appendChild(facultyItem);
    
    // Display student response
    document.getElementById('student-message-display').innerHTML = `<p>${sanitizeText(option.studentResponse)}</p>`;
    
    // Add to history
    const studentItem = document.createElement('div');
    studentItem.className = 'history-item';
    studentItem.innerHTML = `<span class="history-label">Alex:</span> ${sanitizeText(option.studentResponse.substring(0, 80))}...`;
    historyLog.appendChild(studentItem);
    
    // Generate coach analysis
    const coachAnalysis = generateCoachAnalysis(option);
    
    // Update progress
    updateStudentProgress(option);
    
    // Display analysis
    displayAnalysis(option, option.studentResponse, coachAnalysis);
}

function generateCoachAnalysis(option) {
    let analysis = `<p><strong>Analysis of your selection:</strong></p>`;
    
    if (option.quality === 'best') {
        analysis += `<p>Excellent choice! This response demonstrates strong alignment with feedback best practices:</p>`;
        analysis += `<ul>`;
        option.strengths.forEach(s => {
            analysis += `<li>✓ ${s}</li>`;
        });
        analysis += `</ul>`;
        analysis += `<p><strong>Impact:</strong> This approach creates psychological safety, shows genuine support, and promotes collaborative problem-solving—all hallmarks of effective faculty feedback.</p>`;
    } else if (option.quality === 'good') {
        analysis += `<p>Good selection! This response includes several best practices:</p>`;
        analysis += `<ul>`;
        option.strengths.forEach(s => {
            analysis += `<li>✓ ${s}</li>`;
        });
        analysis += `</ul>`;
        if (option.opportunities) {
            analysis += `<p><strong>Consider next time:</strong></p>`;
            analysis += `<ul>`;
            option.opportunities.forEach(o => {
                analysis += `<li>• ${o}</li>`;
            });
            analysis += `</ul>`;
        }
    } else if (option.quality === 'fair') {
        analysis += `<p>This approach has some limitations. Let's identify areas for improvement:</p>`;
        if (option.opportunities) {
            analysis += `<ul>`;
            option.opportunities.forEach(o => {
                analysis += `<li>⚠ ${o}</li>`;
            });
            analysis += `</ul>`;
        }
        analysis += `<p>Notice how the student's response became more defensive? This shows how feedback quality affects the outcome.</p>`;
    } else {
        analysis += `<p>This approach can be counterproductive. Here's why it fell short:</p>`;
        if (option.opportunities) {
            analysis += `<ul>`;
            option.opportunities.forEach(o => {
                analysis += `<li>✗ ${o}</li>`;
            });
            analysis += `</ul>`;
        }
        analysis += `<p><strong>The challenge:</strong> This approach triggers defensive reactions and damages the relationship, making improvement less likely.</p>`;
        analysis += `<p><strong>Reflection:</strong> Consider how reframing these points using best practices from other options could create a more constructive conversation.</p>`;
    }
    
    return analysis;
}

function updateStudentProgress(option) {
    // Quality multiplier
    const multiplier = option.rank === 1 ? 1.0 : option.rank === 2 ? 0.75 : option.rank === 3 ? 0.4 : 0.0;
    
    // Update progress based on quality and what was addressed
    appState.studentProgress.professionalism += Math.floor(20 * multiplier);
    appState.studentProgress.punctuality += Math.floor(20 * multiplier);
    appState.studentProgress.engagement += Math.floor(15 * multiplier);
    
    // Cap at 100%
    Object.keys(appState.studentProgress).forEach(key => {
        appState.studentProgress[key] = Math.min(100, appState.studentProgress[key]);
    });
}

function displayAnalysis(option, studentResponse, coachAnalysis) {
    document.getElementById('feedback-review-text').textContent = option.text;
    document.getElementById('coach-analysis-text').innerHTML = coachAnalysis;
    document.getElementById('student-response-text').textContent = studentResponse;
    
    // Update progress bars
    updateProgressDisplay();
    
    // Update remaining issues
    updateRemainingIssues();
    
    // Switch to analysis screen
    setTimeout(() => {
        switchScreen('analysis-screen');
    }, 1500);
}

function updateProgressDisplay() {
    const progressMap = {
        'professionalism': 'progress-professionalism',
        'punctuality': 'progress-punctuality',
        'engagement': 'progress-engagement',
        'documentation': 'progress-documentation',
        'collaboration': 'progress-collaboration'
    };
    
    Object.keys(appState.studentProgress).forEach(key => {
        const value = appState.studentProgress[key];
        const elementId = progressMap[key];
        const fillElement = document.getElementById(elementId);
        const textElement = document.getElementById(elementId + '-text');
        
        if (fillElement) {
            fillElement.style.width = value + '%';
        }
        if (textElement) {
            textElement.textContent = value + '%';
        }
    });
}

function updateRemainingIssues() {
    const issues = appState.remainingIssues[appState.currentRound] || [];
    const issuesHtml = '<ul>' + issues.map(issue => `<li>${issue}</li>`).join('') + '</ul>';
    document.getElementById('remaining-issues').innerHTML = issuesHtml;
}

function startNextRound() {
    if (appState.currentRound < 3) {
        appState.currentRound++;
        document.getElementById('session-round').textContent = `Round ${appState.currentRound} of 3`;
        document.getElementById('history-log').innerHTML = `<div class="history-item history-system"><span class="history-label">Round ${appState.currentRound}:</span> New scenario with the student.</div>`;
        document.getElementById('feedback-response-panel').classList.add('hidden');
        switchScreen('feedback-screen');
        generateFeedbackOptions();
    } else {
        switchScreen('completion-screen');
    }
}

function showCoachTip() {
    const panel = document.getElementById('coach-tip-panel');
    panel.classList.remove('hidden');
    
    const tips = [
        "<strong>Pro tip:</strong> Start with an open-ended question to understand the student's perspective first. Try asking, 'How do you feel things went today?' before launching into feedback.",
        "<strong>Best practice:</strong> Use the 'situation-behavior-impact' framework. Describe what you observed, the specific behavior, and how it impacts patient care and the team.",
        "<strong>Consider this:</strong> Balance criticism with recognition of effort. Even if performance is struggling, acknowledge what the student is doing well to maintain psychological safety.",
        "<strong>Coaching insight:</strong> Avoid using judgmental language like 'always,' 'never,' or 'unprofessional.' These words trigger defensiveness. Instead, use specific, observable descriptions.",
        "<strong>Key technique:</strong> End with collaborative planning: 'What support do you need?' or 'How can I help you succeed here?' This shifts feedback from evaluative to developmental."
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('coach-content').innerHTML = randomTip;
}

function closeCoachTip() {
    document.getElementById('coach-tip-panel').classList.add('hidden');
}

function reviewCoachTips() {
    switchScreen('practices-screen');
}

function returnToAnalysis() {
    switchScreen('analysis-screen');
}

function resetApp() {
    appState = {
        currentRound: 1,
        studentResponses: [],
        studentProgress: {
            professionalism: 20,
            punctuality: 30,
            engagement: 25,
            documentation: 20,
            collaboration: 25
        },
        feedbackHistory: [],
        bestPracticeScore: 0,
        totalSelections: 0,
        remainingIssues: {
            1: ['Defensive reactions to feedback', 'Limited progress on documentation', 'Inconsistent professionalism'],
            2: ['Continued struggles with time management', 'Documentation still needs improvement', 'Occasional defensiveness persists'],
            3: ['Slow progress on self-awareness', 'Needs more initiative on seeking help', 'Professionalism improving but inconsistent']
        }
    };
    document.getElementById('session-round').textContent = 'Round 1 of 3';
    switchScreen('welcome-screen');
}

function downloadCertificate() {
    const score = Math.round((appState.bestPracticeScore / appState.totalSelections) * 100);
    alert(`Certificate download functionality would be implemented here.\n\nYour Score: ${score}% best practices alignment\nTotal Selections: ${appState.totalSelections}\nBest Practice Selections: ${appState.bestPracticeScore}`);
}

// Utility function to sanitize text for display
function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('Medical Feedback Coach initialized');
});