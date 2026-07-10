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
    remainingIssues: {
        1: ['Defensive reactions to feedback', 'Limited progress on documentation', 'Inconsistent professionalism'],
        2: ['Continued struggles with time management', 'Documentation still needs improvement', 'Occasional defensiveness persists'],
        3: ['Slow progress on self-awareness', 'Needs more initiative on seeking help', 'Professionalism improving but inconsistent']
    }
};

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
    document.getElementById('feedback-input').focus();
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

function submitFeedback() {
    const feedbackText = document.getElementById('feedback-input').value.trim();
    
    if (feedbackText.length < 20) {
        alert('Please provide more detailed feedback (at least 20 characters).');
        return;
    }
    
    // Store feedback
    appState.feedbackHistory.push({
        round: appState.currentRound,
        feedback: feedbackText
    });
    
    // Add to history log
    const historyLog = document.getElementById('history-log');
    const facultyItem = document.createElement('div');
    facultyItem.className = 'history-item';
    facultyItem.innerHTML = `<span class="history-label">You:</span> ${sanitizeText(feedbackText.substring(0, 100))}...`;
    historyLog.appendChild(facultyItem);
    
    // Display student message
    const studentMessage = generateStudentResponse(feedbackText);
    document.getElementById('student-message-display').innerHTML = `<p>${sanitizeText(studentMessage)}</p>`;
    
    // Add to history
    const studentItem = document.createElement('div');
    studentItem.className = 'history-item';
    studentItem.innerHTML = `<span class="history-label">Alex:</span> ${sanitizeText(studentMessage.substring(0, 100))}...`;
    historyLog.appendChild(studentItem);
    
    // Generate coach analysis
    const coachAnalysis = generateCoachAnalysis(feedbackText);
    
    // Update progress
    updateStudentProgress(feedbackText);
    
    // Display analysis
    displayAnalysis(feedbackText, studentMessage, coachAnalysis);
}

function generateStudentResponse(feedbackText) {
    const responses = {
        positive: [
            "Thank you for the feedback. I can see your point about my punctuality. I've been struggling with the commute, but that's not an excuse. I'll set my alarm earlier and plan to arrive 15 minutes before rounds start.",
            "I appreciate you bringing this up. I realize I've been defensive, but I want to improve. Can you help me understand what specific areas of documentation are most critical?",
            "You're right. I haven't been as engaged with the team as I should be. I think I've been intimidated, but I'm going to make more of an effort to participate in case discussions."
        ],
        mixed: [
            "I hear what you're saying, but honestly, I feel like I've been doing better. I was on time three days this week. I'm not sure why you're focusing on the one day I was late.",
            "The documentation feedback is helpful, but I feel like my dress code shouldn't be a focus right now—there's a lot going on. Can we prioritize what's most important?",
            "Okay, I'll try harder. But I also think some of this is just adjustment to the rotation. Things will get better as I learn the system."
        ],
        defensive: [
            "This feels like you're being really hard on me. I'm trying my best. Not everyone can be perfect.",
            "With all due respect, I don't think my professionalism is the issue. I see other interns doing the same thing, and no one says anything to them.",
            "I'm doing fine. I don't know why this meeting is necessary. I think you're being unfair."
        ]
    };
    
    // Analyze feedback quality to determine response
    const hasBestPractices = feedbackText.toLowerCase().includes('i noticed') || 
                            feedbackText.toLowerCase().includes('specific') ||
                            feedbackText.toLowerCase().includes('support') ||
                            feedbackText.toLowerCase().includes('help');
    
    const hasJudgmental = feedbackText.toLowerCase().includes('always') || 
                         feedbackText.toLowerCase().includes('never') ||
                         feedbackText.toLowerCase().includes('unprofessional') ||
                         feedbackText.toLowerCase().includes('careless');
    
    let responseArray;
    if (hasBestPractices && !hasJudgmental) {
        responseArray = responses.positive;
    } else if (hasBestPractices && hasJudgmental) {
        responseArray = responses.mixed;
    } else {
        responseArray = responses.defensive;
    }
    
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

function generateCoachAnalysis(feedbackText) {
    let analysis = "<p><strong>Analysis of your feedback:</strong></p>";
    let strengths = [];
    let opportunities = [];
    
    // Check for best practices
    if (feedbackText.toLowerCase().includes('i noticed') || feedbackText.toLowerCase().includes('i observed')) {
        strengths.push('✓ Using "I-statements" creates a non-accusatory tone');
    } else {
        opportunities.push('• Consider using "I noticed" or "I observed" to lead with examples');
    }
    
    if (feedbackText.toLowerCase().includes('specific') || feedbackText.match(/\d+\s*(minute|hour|time)/i)) {
        strengths.push('✓ You provided specific, concrete examples');
    } else {
        opportunities.push('• Try to include specific examples (times, dates, situations)');
    }
    
    if (feedbackText.toLowerCase().includes('help') || feedbackText.toLowerCase().includes('support') || feedbackText.toLowerCase().includes('work together')) {
        strengths.push('✓ You offered support and collaborative problem-solving');
    } else {
        opportunities.push('• Consider offering support: "How can I help you succeed?"');
    }
    
    if (feedbackText.toLowerCase().includes('always') || feedbackText.toLowerCase().includes('never') || feedbackText.toLowerCase().includes('unprofessional')) {
        opportunities.push('• Avoid absolute language ("always," "never") as it can trigger defensiveness');
    }
    
    if (feedbackText.toLowerCase().includes('strength') || feedbackText.toLowerCase().includes('doing well') || feedbackText.toLowerCase().includes('good')) {
        strengths.push('✓ You balanced feedback with recognition of strengths');
    } else {
        opportunities.push('• Consider acknowledging one thing the student is doing well to maintain psychological safety');
    }
    
    if (feedbackText.toLowerCase().includes('why') || feedbackText.toLowerCase().includes('what') || feedbackText.toLowerCase().includes('how')) {
        strengths.push('✓ You asked open-ended questions to promote reflection');
    }
    
    if (strengths.length > 0) {
        analysis += "<p><strong>What you did well:</strong></p><ul>";
        strengths.forEach(s => analysis += `<li>${s}</li>`);
        analysis += "</ul>";
    }
    
    if (opportunities.length > 0) {
        analysis += "<p><strong>Consider for next time:</strong></p><ul>";
        opportunities.forEach(o => analysis += `<li>${o}</li>`);
        analysis += "</ul>";
    }
    
    analysis += "<p><strong>Overall:</strong> " + (strengths.length >= 3 ? "You're using strong feedback techniques!" : "Keep practicing these techniques—they lead to better student outcomes.") + "</p>";
    
    return analysis;
}

function updateStudentProgress(feedbackText) {
    // Determine if feedback quality affects progress
    const feedbackQuality = feedbackText.toLowerCase().includes('i noticed') || feedbackText.toLowerCase().includes('help') ? 1 : 0.5;
    
    // Update progress based on what was addressed
    if (feedbackText.toLowerCase().includes('professional') || feedbackText.toLowerCase().includes('dress') || feedbackText.toLowerCase().includes('attire')) {
        appState.studentProgress.professionalism += Math.floor(20 * feedbackQuality);
    }
    if (feedbackText.toLowerCase().includes('late') || feedbackText.toLowerCase().includes('punctual') || feedbackText.toLowerCase().includes('time')) {
        appState.studentProgress.punctuality += Math.floor(20 * feedbackQuality);
    }
    if (feedbackText.toLowerCase().includes('engagement') || feedbackText.toLowerCase().includes('participate') || feedbackText.toLowerCase().includes('team')) {
        appState.studentProgress.engagement += Math.floor(15 * feedbackQuality);
    }
    if (feedbackText.toLowerCase().includes('documentation') || feedbackText.toLowerCase().includes('notes') || feedbackText.toLowerCase().includes('record')) {
        appState.studentProgress.documentation += Math.floor(20 * feedbackQuality);
    }
    if (feedbackText.toLowerCase().includes('collaboration') || feedbackText.toLowerCase().includes('team') || feedbackText.toLowerCase().includes('together')) {
        appState.studentProgress.collaboration += Math.floor(15 * feedbackQuality);
    }
    
    // Cap at 100%
    Object.keys(appState.studentProgress).forEach(key => {
        appState.studentProgress[key] = Math.min(100, appState.studentProgress[key]);
    });
}

function displayAnalysis(feedbackText, studentResponse, coachAnalysis) {
    document.getElementById('feedback-review-text').textContent = feedbackText;
    document.getElementById('coach-analysis-text').innerHTML = coachAnalysis;
    document.getElementById('student-response-text').textContent = studentResponse;
    
    // Update progress bars
    updateProgressDisplay();
    
    // Update remaining issues
    updateRemainingIssues();
    
    // Clear input
    document.getElementById('feedback-input').value = '';
    
    // Switch to analysis screen
    switchScreen('analysis-screen');
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
        document.getElementById('feedback-input').value = '';
        document.getElementById('history-log').innerHTML = `<div class="history-item history-system"><span class="history-label">Round ${appState.currentRound}:</span> New scenario with the student...</div>`;
        switchScreen('feedback-screen');
        document.getElementById('feedback-input').focus();
    } else {
        switchScreen('completion-screen');
    }
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
    alert('Certificate download functionality would be implemented here. In a real application, this would generate a PDF certificate of completion.');
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