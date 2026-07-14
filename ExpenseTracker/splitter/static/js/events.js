import { openEventModal, openEditEventModal, openDeleteEventModal, closeModal, initializeModalListeners } from './modals.js';

if (!window.eventsJsAlreadyLoaded) {
    window.eventsJsAlreadyLoaded = true;

    document.addEventListener("DOMContentLoaded", async function () {
        console.log("📌 Events DOMContentLoaded Fired");

        const eventId = getEventIdFromURL();

        if (eventId) {
            await displaySingleEvent(eventId);
            attachEventListeners(eventId);
        } else {
            // ✅ Add Event Button
            const addEventButton = document.getElementById("addEventButton");
            if (addEventButton) {
                addEventButton.addEventListener("click", () => {
                    openEventModal();
                });
            }

            // Create Event Form
            const composeForm = document.getElementById('modal-event-form');
            if (composeForm) {
                composeForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    createEvent();
                });
            }

            // Delete Event Button (in delete modal)
            const deleteEventButton = document.getElementById("confirmDeleteButton");
            if (deleteEventButton) {
                deleteEventButton.addEventListener("click", function () {
                    const eventId = this.dataset.eventId;
                    if (eventId) {
                        deleteEvent(eventId);
                    }
                });
            }

            // Save Edited Event Button
            const saveEditButton = document.getElementById("saveEditEventButton");
            if (saveEditButton) {
                saveEditButton.addEventListener("click", function () {
                    const eventId = this.dataset.eventId;
                    if (eventId) {
                        const updatedEvent = {
                            content: document.getElementById("editEventTextarea").value
                        };
                        updateEvent(eventId, updatedEvent);
                    }
                });
            }
        }

        initializeModalListeners();
        loadMoreEvents();

        // Pre-fill date field
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('modalEventDate');

        if (dateInput) {
            dateInput.value = today;

            // Open the native date picker when the input is clicked
            dateInput.addEventListener('click', () => {
                if (typeof dateInput.showPicker === 'function') {
                    dateInput.showPicker();
                }
            });
        }

    });
}

function getEventIdFromURL() {
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    return pathSegments.length >= 2 && pathSegments[0] === "events"
        ? parseInt(pathSegments[1], 10)
        : null;
}

let offset = 0;
const limit = 10;
let loading = false;

window.addEventListener('scroll', () => {
    if (loading) return;

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadMoreEvents();
    }
});

function loadMoreEvents() {
    loading = true;
    const loadingIndicator = document.getElementById('loading');
    if (loadingIndicator) loadingIndicator.style.display = 'block';

    fetch(`/api/events?offset=${offset}&limit=${limit}`)
        .then(response => response.json())
        .then(events => {
            const container = document.querySelector('.eventsContainer');
            if (!container) {
                console.error("❌ .eventsContainer not found");
                return;
            }

            if (events.length === 0) {
                window.removeEventListener('scroll', loadMoreEvents);
                if (loadingIndicator) loadingIndicator.textContent = 'No more events';
                return;
            }

            events.forEach(event => {
                const card = document.createElement('div');
                card.className = 'eventCard';
                card.dataset.eventId = event.id;

                card.innerHTML = `
                    <div class="eventCardHeader">
                        <h3 class="eventCardTitle">${event.name}</h3>
                        <div class="eventCardActions">
                            <button class="editEventButton">Edit</button>
                            <button class="deleteEventButton">Delete</button>
                        </div>
                    </div>
                    <div class="eventCardContent">
                        <p class="eventCardDate">${event.created_at}</p>
                    </div>
                `;

                container.appendChild(card);

                card.querySelector('.editEventButton').addEventListener("click", () => {
                    openEditEventModal(event.id);
                });

                card.querySelector('.deleteEventButton').addEventListener("click", () => {
                    openDeleteEventModal(event.id);
                });
            });

            offset += events.length;
            loading = false;
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        })
        .catch(err => {
            console.error(err);
            loading = false;
        });
}

async function displaySingleEvent(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) throw new Error(`Failed to fetch event: ${response.statusText}`);
        const data = await response.json();
        updateEventUI(data, eventId);
    } catch (err) {
        console.error("❌ Error fetching event details:", err);
    }
}

function updateEventUI(data, eventId) {
    const textarea = document.getElementById("editEventTextarea");
    if (textarea) textarea.value = data.event.content || data.event.name;
}

function attachEventListeners(eventId) {
    const deleteEventButton = document.getElementById("confirmDeleteButton");
    if (deleteEventButton) {
        deleteEventButton.addEventListener("click", () => {
            deleteEvent(eventId);
        });
    }

    const saveEditButton = document.getElementById("saveEditEventButton");
    if (saveEditButton) {
        saveEditButton.addEventListener("click", () => {
            const updatedEvent = {
                content: document.getElementById("editEventTextarea").value
            };
            updateEvent(eventId, updatedEvent);
        });
    }
}

// CRUD FUNCTIONS

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(trimmed.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export function createEvent() {
    const eventName = document.getElementById('modalNewEvent').value.trim();
    const eventDate = document.getElementById('modalEventDate').value.trim();
    const participantsInput = document.getElementById('modalParticipants').value.trim();

    if (!eventName) {
        alert("Please write a name for the event.");
        return;
    }

    const participants = participantsInput
        ? participantsInput.split(',').map(p => p.trim()).filter(Boolean)
        : [];

    fetch('/api/events/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            name: eventName,
            date: eventDate,
            participants: participants
        })
    })
    .then(response => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
    })
    .then(data => {
        console.log('✅ Event created:', data);
        closeModal('addEventModal');
        window.location.reload(); // or call loadMoreEvents();
    })
    .catch(error => {
        console.error('❌ Error creating event:', error);
        alert("Error creating event. Please try again.");
    });
}

export function updateEvent(eventId, updatedEvent) {
    if (!updatedEvent.content || updatedEvent.content.trim() === '') {
        alert("Event content cannot be empty.");
        return;
    }

    fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            name: updatedEvent.content
        })
    })
    .then(response => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
    })
    .then(data => {
        console.log('✅ Event updated:', data);
        closeModal('editEventModal');
        window.location.reload();
    })
    .catch(error => {
        console.error('❌ Error updating event:', error);
        alert("Error updating event. Please try again.");
    });
}

export function deleteEvent(eventId) {
    fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
    })
    .then(data => {
        console.log('🗑️ Event deleted:', data);
        closeModal('deleteEventModal');
        window.location.reload();
    })
    .catch(error => {
        console.error('❌ Error deleting event:', error);
        alert("Error deleting event. Please try again.");
    });
}
