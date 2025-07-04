const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

export function createEvent(event) {
    event.preventDefault();

    const eventName = document.getElementById('event-name').value;
    if (!eventName) {
        alert("Please write a name for the event.");
        return;
    }

    return fetch('/api/events/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ name: eventName }),
    })
    .then(response => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
    })
    .then(data => {
        window.location.href = `/events/${data.id}`;
    })
    .catch(error => {
        console.error('Error creating event:', error);
        alert('Error creating event. Please try again.');
    });
}

export async function getAllEvents() {
    const response = await fetch('/api/events', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
}

export async function getEventById(eventId) {
    const response = await fetch(`/api/events/${eventId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
}

export function deleteEvent(eventId) {
    return fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
    })
}

export function updateEvent(eventId, event) {
    return fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(event),
    })
}

