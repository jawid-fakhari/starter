'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
/////////////////////////////////////
//Workout Class
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10); // making unique id
  constructor(coords, duration, distance) {
    this.coords = coords; // [lat, lng]
    this.duration = duration; // in min
    this.distance = distance; // in km
  }
}
// Running class is Workout class child, Pace calculation
class Running extends Workout {
  type = 'running';
  constructor(coords, duration, distance, cadence) {
    super(coords, duration, distance);
    this.cadence = cadence;
    this.clacPace();
  }
  clacPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

// Cycling class is Workout class child, Speed calculation
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, duration, distance, elevationGain) {
    super(coords, duration, distance);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / this.duration / 60;
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([35, -102], 180, 50, 520);
// console.log(run1, cycling1);

//////////////////////////////////////
// Refactoring the mapty App using Classes
class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function (error) {
          console.error('Errore nella geolocalizzazione: ' + error.message);
        }
      );
    } else {
      console.log('Geolocalizzazione non supportata.');
    }
  }

  _loadMap(position) {
    // Ora hai le coordinate lat e lon
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const coords = [lat, lon];
    // find the position and set the map
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);

    //create a Marker on the map My position
    const marker = L.marker([lat, lon]).addTo(this.#map);
    marker
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent('My position')
      .openPopup();

    //eventhandler onclick
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // helper function to check inputs are valid!
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();
    // Get data from the form
    let workout;
    const type = inputType.value;
    const distance = +inputDistance.value; //+ change the value to number
    const duration = +inputDuration.value; //+ change the value to number
    const { lat, lng } = this.#mapEvent.latlng;

    // If workout Running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //Check if data is valid
      if (
        /*!Number.isFinite(cadence) ||  //first method
         !Number.isFinite(distance) ||
         !Number.isFinite(cadence)*/
        !validInputs(distance, duration, cadence) || //second method, using helper method
        !allPositive(distance, duration, cadence)
      )
        return alert('Choose a positive number');

      workout = new Running([lat, lng], duration, distance, cadence);
    }

    // If workout Cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      //Check if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Choose a positive number');

      workout = new Cycling([lat, lng], duration, distance, elevation);
    }

    this.#workouts.push(this.workout);

    // Add new object to workout array

    // Render workout on map as marker
    this.renderWorkoutMarker(workout);
    // Render workout on list

    // Hide the form + clear input fields
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }
  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('workout')
      .openPopup();
  }
}

const app = new App();
