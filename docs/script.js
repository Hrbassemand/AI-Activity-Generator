// Function to save an activity to local storage
function saveActivityToLocal(activity) {
    let activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.push({ text: activity, done: false });
    localStorage.setItem('activities', JSON.stringify(activities));
}

// Function to display all activities stored in local storage
function displayActivities() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const activitiesList = document.getElementById('activitiesList');
    activitiesList.innerHTML = ''; // Clear existing entries

    activities.forEach((activity, index) => {
        let div = document.createElement('div');
        div.classList.add('activity');
        if (activity.done) div.classList.add('done');

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('checkbox');
        checkbox.checked = activity.done;
        checkbox.onchange = () => toggleDone(index);

        let span = document.createElement('span');
        span.classList.add('activity-text');
        span.textContent = activity.text;

        let deleteIcon = document.createElement('span');
        deleteIcon.classList.add('delete-icon');
        deleteIcon.innerHTML = '&times;';
        deleteIcon.onclick = () => deleteActivity(index);

        div.appendChild(checkbox);
        div.appendChild(span);
        div.appendChild(deleteIcon);
        activitiesList.appendChild(div);
    });
}

// Function to toggle the done status of an activity
function toggleDone(index) {
    let activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities[index].done = !activities[index].done;
    localStorage.setItem('activities', JSON.stringify(activities));
    displayActivities();
}

// Function to delete an activity
function deleteActivity(index) {
    let activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.splice(index, 1);
    localStorage.setItem('activities', JSON.stringify(activities));
    displayActivities();
}

// Function to clear all activities
function clearActivities() {
    localStorage.removeItem('activities');
    displayActivities();
}

// Function to handle save action
function handleActivity(activityText) {
    saveActivityToLocal(activityText);
    displayActivities(); // Refresh the list of activities
    document.getElementById('activitySuggestion').textContent = 'Your activity will appear here...'; // Reset the suggestion text
}

// Function to check if an activity is similar to an existing one
function isSimilarActivity(newActivity) {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const cleanedNewActivity = newActivity.toLowerCase().replace(/[^a-z0-9]/g, '');
    return activities.some(activity => {
        const cleanedExistingActivity = activity.text.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanedExistingActivity.includes(cleanedNewActivity) || cleanedNewActivity.includes(cleanedExistingActivity);
    });
}

// Function to generate a unique activity
async function generateUniqueActivity(prompt, maxTokens) {
    let attempts = 0;
    while (attempts < 10) { // Limit attempts to prevent infinite loops
        const response = await fetch('/generateActivity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: maxTokens
            })
        });
        const data = await response.json();
        const activityText = data.activity.trim();

        if (!isSimilarActivity(activityText)) {
            return activityText;
        } else {
            console.log(`Generated similar activity: ${activityText}`);
        }

        attempts++;
    }
    return 'Failed to generate a unique activity. Please try again.';
}

// Set up event listeners and initialize the display of activities on page load
window.onload = function() {
    displayActivities();

    document.getElementById('suggestionButton').addEventListener('click', async function() {
        const peopleCount = document.getElementById('peopleCount').value;
        const timeAvailable = document.getElementById('timeAvailable').value;
        const activityType = document.getElementById('activityType').value;
        const interests = document.getElementById('interests').value;
        const location = document.getElementById('location').value;

        let prompt = 'Suggest a';
        if (activityType) {
            prompt += ` ${activityType}`;
        } else {
            prompt += ' fun';
        }
        prompt += ' activity';
        if (peopleCount) {
            prompt += ` for ${peopleCount} people`;
        }
        if (timeAvailable) {
            prompt += ` that takes ${timeAvailable} minutes`;
        }
        if (interests) {
            prompt += ` that a person who likes ${interests} would also like`;
        }
        if (location) {
            prompt += ` specific to ${location}`;
        }
        prompt += '. Be concise.';

        const uniqueActivity = await generateUniqueActivity(prompt, 60);
        document.getElementById('activitySuggestion').textContent = uniqueActivity;

        // Set up event listener for Save button
        document.getElementById('saveButton').onclick = () => handleActivity(uniqueActivity);
    });

    document.getElementById('clearListButton').addEventListener('click', clearActivities);
};
