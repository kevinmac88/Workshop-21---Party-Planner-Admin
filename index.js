const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2508-FTB-ET-WEB-FT";
const RESOURCE = "/events";
const API = BASE + COHORT + RESOURCE;

let events = [];
let selectedEvent;

async function getEvents() {
  try {
    const response = await fetch(API);
    const result = await response.json();
    events = Array.isArray(result.data) ? result.data : [];
    render();
  } catch (err) {
    console.error(err);
  }
}

async function getEvent(id) {
  try {
    const response = await fetch(API + "/" + id);
    const result = await response.json();
    selectedEvent = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

async function addEvent(event) {
  try {
    const res = await fetch(API, {
      method: "POST",
      body: JSON.stringify(event),
      headers: { "Content-Type": "application/json" },
    });
    const json = await res.json();
    if (json.success) {
      getEvents();
    }
  } catch (err) {
    console.error(err);
  }
}

async function removeEvent(id) {
  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);

    if (selectedEvent?.id === id) {
      selectedEvent = undefined;
    }

    await getEvents();
  } catch (err) {
    console.error(err);
  }
}

function EventListItem(event) {
  const $li = document.createElement("li");
  $li.innerHTML = `
    <a href="#selected">${event.name}</a>`;
  $li.addEventListener("click", () => getEvent(event.id));
  return $li;
}

function EventList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("lineup");

  const $events = events.map(EventListItem);
  $ul.replaceChildren(...$events);

  return $ul;
}

function EventDetails() {
  if (!selectedEvent) {
    const $p = document.createElement("p");
    $p.textContent = "Please select an event to learn more.";
    return $p;
  }
  const { name, description, date, location } = selectedEvent;

  const $event = document.createElement("section");
  $event.classList.add("event");
  $event.innerHTML = `
<h3>${selectedEvent.name} ${selectedEvent.id}</h3>
  <p><span class="key"> Name: </span>${selectedEvent.name} </p>
   <p> <span class="key">Description:</span> ${selectedEvent.description} </p>
    <p> <span class="key">Date:</span> ${selectedEvent.date} </p>
     <p> <span class="key">Location:</span> ${selectedEvent.location}</p>
  <button>Remove Event</button>`;
  const $button = $event.querySelector("button");
  $button.addEventListener("click", function () {
    removeEvent(selectedEvent.id);
  });
  return $event;
}

function NewEventForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
    <label>
    Name
    <input name="name" required />
    </label>
    <label>
    Description
    <input name="description" required />
    </label>
    <label>
  Date
  <input type="datetime-local" name="date" required />
</label>
       <label>
    Location
    <input name="location" required />
    </label>
    <button>Add Event</button>`;

  $form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const data = new FormData($form);

    const raw = data.get("date"); // "YYYY-MM-DDTHH:MM"
    if (Number.isNaN(Date.parse(raw))) {
      alert("Please pick a valid date & time.");
      return;
    }
    const iso = new Date(raw).toISOString(); // ISO string with timezone (Z)

    const payload = {
      name: data.get("name"),
      description: data.get("description"),
      date: iso, // <-- use ISO
      location: data.get("location"),
    };

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        console.error(json);
        alert(json?.error?.message || "Create failed.");
        return;
      }

      await getEvents(); // refresh list after successful create
      $form.reset();
    } catch (err) {
      console.error(err);
      alert("Network/Server error creating event.");
    }
  });
  return $form;
}
//render
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Kevin's Event Planner</h1>
    <main>
    <section>
    <h2>Upcoming Events</h2>
    <EventList></EventList>
    <h3>Add a new event</h3>
    <NewEventForm></NewEventForm>
    </section>
    <section id="selected">
    <h2>Event Details</h2>
    <EventDetails></EventDetails>
    </section>
    </main>`;

  $app.querySelector("EventList").replaceWith(EventList());
  $app.querySelector("NewEventForm").replaceWith(NewEventForm());
  $app.querySelector("EventDetails").replaceWith(EventDetails());
}

async function init() {
  await getEvents();
  render();
}

init();
