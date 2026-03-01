// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2512-FTB-CT-WEB-PT"; 
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }


  //I am going to be adding my edits and adding selectedParty() and the party form
  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button>Remove Party </button>
  `;
  //Adding the delete button here, I won't touch return $party as it is making my code easier.
  const $delete = $party.querySelector("button");
  $delete.addEventListener("click", () => removeParty(selectedParty.id));
  $party.querySelector("GuestList").replaceWith(GuestList());
  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

//Everything below is my code
// We will be kicking off the code with addParty, this will bring our data in  from the API 
// Specifically in the events, this will also set me up to send parties as we will use this code later 
// in the code. getParties = fetches and addParty() sends a POST request
async function addParty(party) {
 try{await fetch(API + "/events", {
    method: 'POST',
    headers: {"Content-Type" : "application/json"},
    body: JSON.stringify(party),
  }); getParties();}catch(e){
    console.error(e);
  }
}

//The bottom portion handles the addition of new party form
//once the user clicks the submit it will send our data (name, description, location and date (which was turn from a string to a date object (toISOString)))
//the await addParty sends our data to the API which is then displayed on the screen. 
// return form just returns what was already done. toISOString was a good warning. 

function NewPartyForm(){
  const $form = document.createElement("form");
  $form.innerHTML = `
  <label>
  Name:
  <input name="name" required/>
  </label>
  <label>
  Description:
  <input name="description" required/>
  </label>
  <label>
  Location:
  <input name="location" required/>
  </label>
  <label>
  Date:
  <input name="date" required/>
  </label>
  <button> Create Party! </button>
  `;
$form.addEventListener("submit", async(e) =>{ 
  e.preventDefault();
  const data = new FormData($form);
  console.log(data.get("name"));
  console.log(data.get("description"));
  console.log(data.get("location"));
  console.log(data.get("date"));
  await addParty ({
    name: data.get("name"),
    description: data.get("description"),
    location: data.get("location"),
    date: new Date(data.get("date")).toISOString(),
  })
})
return $form;
}


//The next part I will be writing will be is a remove function it will fetch the API and the ID of events
//then it will rerender getParties after it was deleted. 
async function removeParty(id) {
  try{await fetch (`${API}/events/${id}`,{
    method: "DELETE",
  });
  selectedParty = null;
  getParties();
  } catch (e){
    console.error(e)
  }
}


//What i added was NewPartyForm and PartyList as that renders the data.
// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
      <section>
      <NewPartyForm> </NewPartyForm>
      </section>
    </main>
  `
  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.querySelector("NewPartyForm").replaceWith(NewPartyForm());
}


async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}


//Question for Byron, I am trying to still figure out what init does, if its like 
init();
