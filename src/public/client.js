// Immutable state object
let store = Immutable.Map({
  user: Immutable.Map({ name: "Student" }),
  apod: "",
  rovers: Immutable.List(["curiosity", "opportunity", "spirit"]),
  currentRover: "none",
});

// add our markup to the page
const root = document.getElementById("root");
const rovers = document.getElementsByClassName("btn");

const updateStore = (store, newState) => {
  store = Object.assign(store, newState);
  render(root, store);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = (state) => {
  // check if "currentRover" is "none" and render buttons
  if (state.get("currentRover") === "none") {
    return `
          <header>
             <div class="navbar-flex">
                    <div class="logo-flex" onclick="handleHome(event)">
                        <a href="#"><img src="./assets/mars.png" alt="Mars icon"></a>
                        <p>Mars Dashboard</p>
                    </div>
                </div>
          </header>
          <main>
              <div class="container" style="background-image: url(${ImageOfTheDay(
                state
              )});">
                  <div class="wrapper-buttons">
                      <h1 class="main-title">Discover Mars Rovers</h1>		
                      <div class="button-container">${renderMenu(state)}</div>
                  </div>
              </div>                  
              </section>
          </main>
          <footer>
               <div class="credits">Icons made by <a href="https://www.flaticon.com/authors/monkik" title="monkik">monkik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
          </footer>
      `;
  } else {
    // check if "currentRover" has a value and render images
    return `
      <header>
          <div class="navbar-flex">
              <div class="logo-flex" onclick="handleHome(event)">
                 <a href="#"><img src="./assets/mars.png" alt="Mars icon"></a>
                  <p>Mars</p>
               </div>
               <ul class="items-navbar">${renderMenuItems(state)}<ul>
          </div>
      </header>
          <div class="container-info">
              <h1 class="title">Discover everything to know about <span>${
                state.get("currentRover").latest_photos[0].rover.name
              }</span></h1>		
              <div class="gallery">${renderImages(state)}</div>
          </div>
          <footer>
              <div class="credits">Icons made by <a href="https://www.flaticon.com/authors/monkik" title="monkik">monkik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
              </div>
          <footer>
      `;
  }
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure function -- component to render container for the rover buttons
const renderMenu = (state) => {
  return `<ul class="flex">${renderButtonState(state)}</ul>`;
};

// Pure function -- component to render rover buttons
const renderButtonState = (state) => {
  //turn Immutable List into a regular array with Array.from
  //get access to immutable values with .get
  return Array.from(state.get("rovers"))
    .map(
      (item) =>
        `<li id=${item} class="flex-item btn" onclick="handleClick(event)">
          <a ref="#"  class=""  >${capitalize(`${item}`)}</a>
      </li>`
    )
    .join("");
};

// Pure function -- component to render items for the menu on the header
const renderMenuItems = (state) => {
  // change to different id like ${item}-header
  //turn Immutable List into a regular array
  return Array.from(state.get("rovers"))
    .map(
      (item) =>
        `<li id=${item} class="" onclick="handleClick(event)">
          <a ref="#"  class=""  >${capitalize(`${item}`)}</a>
      </li>`
    )
    .join("");
};

// Pure function -- component to render images and data
const renderImages = (state) => {
  const base = state.get("currentRover");

  // with join method returns an array without commas
  return Array.from(base.latest_photos)
    .map(
      (item) =>
        `<div class="wrapper">
          <img src="${item.img_src}" />
          <div class="wrapper-info">
              <p><span>Image date:</span> ${item.earth_date}</p>
              <p><span>Rover:</span> ${item.rover.name}</p>
              <p><span>State of the rover:</span> ${item.rover.status}</p>
              <p><span>Launch date:</span> ${item.rover.launch_date}</p>
              <p><span>Landing date:</span> ${item.rover.landing_date}</p>
          </div>
       </div>`
    )
    .slice(0, 50)
    .join("");
};

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (state) => {
  if (!state.get("apod")) {
    getImageOfTheDay(store);
  } else if (state.get("apod").image.media_type === "video") {
    // fallback in case the image of the day is a video
    return `https://apod.nasa.gov/apod/image/2102/Siemiony_las_31_01_2021_1024.jpg`;
  } else {
    return `
          ${state.get("apod").image.url}
      `;
  }
};

// ------------------------------------------------------  HANDLE CLICK

// onclick on buttons
const handleClick = (event) => {
  // set id of the button clicked to a new variable
  const { id } = event.currentTarget;
  // check if the id is included in rovers of the store
  if (Array.from(store.get("rovers")).includes(id)) {
    // get currentRover images and data from the server
    getRoverImages(id, store);
  } else {
    console.log(`ups!!! is not included`);
  }
};

// click on logo to render home page
const handleHome = (event) => {
  // set currentRover to none to render home page
  const newState = store.set("currentRover", "none");
  // updates the old state with the new information
  updateStore(store, newState);
};

// ------------------------------------------------------  UTILITY

// Pure function -- capitalize words
const capitalize = (word) => {
  return `${word[0].toUpperCase()}${word.slice(1)}`;
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = async (state) => {
  let { apod } = state;
  const response = await fetch(`http://localhost:3000/apod`);
  apod = await response.json(); // get data from the promise returned by .json()
  const newState = store.set("apod", apod);
  updateStore(store, newState);
  return apod;
};

// Request to the backend to get rovers data
const getRoverImages = async (roverName, state) => {
  // set the state.currentRover to currentRover
  let { currentRover } = state;
  // get data from the server
  const response = await fetch(`http://localhost:3000/rovers/${roverName}`); // get data or Response from the promise returned by fetch()
  currentRover = await response.json(); // get data from the promise returned by .json()

  // set data from the server to Immutable 'currenRover'
  const newState = store.set("currentRover", currentRover);
  // updates the old state with the new information
  updateStore(store, newState);
  return currentRover;
};
