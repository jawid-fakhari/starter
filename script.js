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

let map;
let mapEvent;

if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      // Ora hai le coordinate lat e lon
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const coords = [lat, lon];
      // trava lat, lon sulla mappa e vai alla posizione
      map = L.map('map').setView(coords, 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Crea un marcatore e aggiungilo alla mappa MY POSITION
      const marker = L.marker([lat, lon]).addTo(map);
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
      map.on('click', function (mapE) {
        mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
      });
    },
    function (error) {
      console.error('Errore nella geolocalizzazione: ' + error.message);
    }
  );
} else {
  console.log('Geolocalizzazione non supportata.');
}

form.addEventListener('submit', function (e) {
  e.preventDefault();

  inputDistance.value =
    inputCadence.value =
    inputDuration.value =
    inputElevation.value =
      '';

  const { lat, lng } = mapEvent.latlng;

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 200,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('Workout')
    .openPopup();
});

inputType.addEventListener('change', function () {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});
