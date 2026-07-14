const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

export function openEventModal(eventId) {
    const modal = document.getElementById("addEventModal");
    if (!modal) {
        console.error("❌ Error: addEventModal not found in the DOM.");
        return;
    }

    modal.style.display = "block";

    const modalEventIdInput = document.getElementById("modalEventId");
    if (modalEventIdInput) {
        modalEventIdInput.value = eventId || "";
    } else {
        console.error("❌ Error: modalEventId input not found.");
    }
}

export function openEditEventModal(eventId) {
    const modal = document.getElementById("editEventModal");
    if (!modal) {
        console.error("❌ Error: editEventModal not found in the DOM.");
        return;
    }

    modal.style.display = "block";

    fetch(`/api/events/${eventId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("editEventTextarea").value = data.event.event_content;
            document.getElementById("saveEditEventButton").dataset.eventId = eventId;
            document.getElementById("deleteEventButton").dataset.eventId = eventId;
        })
        .catch(error => {
            alert("Failed to fetch event information.");
        });
}

export function openDeleteEventModal(eventId) {
    const modal = document.getElementById("deleteEventModal");
    if (!modal) {
        console.error("❌ Error: deleteEventModal not found in the DOM.");
        return;
    }

    modal.style.display = "block";
    document.getElementById("confirmDeleteButton").dataset.eventId = eventId;
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    } else {
        console.warn(`⚠️ Attempted to close non-existent modal: ${modalId}`);
    }
}

export function initializeModalListeners() {
    // Close modals on close buttons
    const closeModalButtons = document.querySelectorAll("[data-modal-target]");
    closeModalButtons.forEach(button => {
        button.addEventListener("click", function () {
            const modalId = this.getAttribute("data-modal-target");
            closeModal(modalId);
        });
    });

    // Close modals on outside click
    window.addEventListener("click", function (event) {
        ["addEventModal", "editEventModal", "deleteEventModal"].forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && event.target === modal) {
                closeModal(modalId);
            }
        });
    });

    // Add Event button
    document.getElementById("addEventButton")?.addEventListener("click", () => openEventModal());

    // Edit buttons
    document.querySelectorAll(".editEventButton").forEach(button => {
        button.addEventListener("click", () => {
            const eventCard = button.closest(".eventCard");
            const eventId = eventCard?.dataset.eventId;
            if (eventId) openEditEventModal(eventId);
        });
    });

    // Delete buttons
    document.querySelectorAll(".deleteEventButton").forEach(button => {
        button.addEventListener("click", () => {
            const eventCard = button.closest(".eventCard");
            const eventId = eventCard?.dataset.eventId;
            if (eventId) openDeleteEventModal(eventId);
        });
    });
}

// Initialize listeners when the module loads
// initializeModalListeners();




// export function formatTimestamp(dateString) {
//     if (!dateString) {
//         return "Invalid date";
//     }

//     const postDate = new Date(dateString);

//     if (isNaN(postDate.getTime())) {
//         return "Invalid date";
//     }

//     const hours = postDate.getHours();
//     const minutes = postDate.getMinutes().toString().padStart(2, "0");
//     const ampm = hours >= 12 ? "PM" : "AM";
//     const formattedHours = hours % 12 || 12;

//     const month = postDate.toLocaleString('default', { month: 'long' });
//     const day = postDate.getDate();
//     const year = postDate.getFullYear();

//     return `${formattedHours}:${minutes} ${ampm} · ${month} ${day}, ${year}`;
// }