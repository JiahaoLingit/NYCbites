/*******************************************************
 * 1. Firebase Imports & Initialization
 *******************************************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7E2JhuYo_nArVWk3zSJVbRmL0D_RqKHA",
  authDomain: "outandaboutnyc-d1fc1.firebaseapp.com",
  projectId: "outandaboutnyc-d1fc1",
  storageBucket: "outandaboutnyc-d1fc1.appspot.com",
  messagingSenderId: "258281299106",
  appId: "1:258281299106:web:8ed88794116fd110f14bfb",
  measurementId: "G-C8EWDPF9HZ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

/*******************************************************
 * DOMContentLoaded Wrapper
 *******************************************************/
document.addEventListener('DOMContentLoaded', () => {
  const scheduleGrid = document.querySelector('.schedule-grid');
  const intervalSelect = document.getElementById('intervalSelect');
  const submitBtn = document.getElementById('submitBtn');
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const signUpBtn = document.getElementById("signUpBtn");
  const signInBtn = document.getElementById("signInBtn");
  const signOutBtn = document.getElementById("signOutBtn");
  const authStatus = document.getElementById("authStatus");
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");

  /*******************************************************
   * Weather
   *******************************************************/
  async function fetchWeather(lat, lon) {
    const apiKey = "efbd5a87920aa63ac28581ffdc45c4ae";
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
    }
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const currentWeatherData = await fetchWeather(latitude, longitude);
        const weatherContainer = document.getElementById("weatherContainer");
        if (weatherContainer && currentWeatherData) {
          const condition = currentWeatherData.weather[0].main;
          const description = currentWeatherData.weather[0].description;
          const temp = currentWeatherData.main.temp;
          weatherContainer.innerHTML = `<p>${condition} (${description}) | Temperature: ${temp}°C</p>`;
        }
      },
      () => {
        const weatherContainer = document.getElementById("weatherContainer");
        if (weatherContainer) {
          weatherContainer.innerHTML = "<p>Unable to load location/weather.</p>";
        }
      }
    );
  }

  /*******************************************************
   * Schedule Selection + Saving
   *******************************************************/
  const timeBlocks = {
    hourly: ["12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"],
    "half-hourly": [
      "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
      "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
      "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM",
      "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"
    ]
  };

  function createTimeRow(timeLabel) {
    const row = document.createElement('div');
    row.className = 'time-row';
    const timeCell = document.createElement('div');
    timeCell.className = 'time-cell';
    timeCell.textContent = timeLabel;
    row.appendChild(timeCell);

    for (let i = 0; i < 7; i++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'day-cell';
      dayCell.addEventListener('click', () => {
        dayCell.classList.toggle('selected');
      });
      row.appendChild(dayCell);
    }

    return row;
  }

  function renderSchedule(interval) {
    const oldRows = scheduleGrid?.querySelectorAll('.time-row') || [];
    oldRows.forEach(row => row.remove());
    timeBlocks[interval].forEach(time => {
      const row = createTimeRow(time);
      scheduleGrid?.appendChild(row);
    });
  }

  if (scheduleGrid && submitBtn) {
    renderSchedule('hourly');

    intervalSelect?.addEventListener('change', (e) => {
      renderSchedule(e.target.value);
    });

    submitBtn.addEventListener('click', () => {
      const selectedCells = document.querySelectorAll('.day-cell.selected');
      const availability = [];

      selectedCells.forEach(cell => {
        const row = cell.parentElement;
        const time = row.querySelector('.time-cell').textContent;
        const columnIndex = Array.from(row.children).indexOf(cell) - 1;
        const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][columnIndex];
        availability.push({ day, time });
      });

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          await setDoc(doc(db, "availability", user.uid), { availability });
          alert("Your availability has been saved!");
        } else {
          alert("You must be signed in to save your schedule.");
        }
      });
    });
  }

  /*******************************************************
   * Auth: Sign Up / In / Out
   *******************************************************/
  if (signUpBtn) {
    signUpBtn.addEventListener("click", async () => {
      try {
        // Validate name fields
        if (!firstName.value.trim() || !lastName.value.trim()) {
          alert("Please enter both first and last name");
          return;
        }

        // Use the full name as entered by the user
        const fullName = `${firstName.value.trim()} ${lastName.value.trim()}`;
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail.value, authPassword.value);

        // Set the full name as displayName
        await updateProfile(userCredential.user, {
          displayName: fullName
        });
        
        // Force reload to get updated profile
        await auth.currentUser.reload();
        
        console.log("Signed up and profile updated:", auth.currentUser);
        
        window.location.href = "schedule.html";
      } catch (error) {
        alert("Error signing up: " + error.message);
      }
    });
  }

  if (signInBtn) {
    signInBtn.addEventListener("click", async () => {
      try {
        await signInWithEmailAndPassword(auth, authEmail.value, authPassword.value);
      } catch (error) {
        alert("Sign-in error: " + error.message);
      }
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        localStorage.clear();
        sessionStorage.clear();
        // Wait for auth change to detect before redirect
      } catch (error) {
        alert("Sign-out failed: " + error.message);
      }
    });
  }

  /*******************************************************
   * Monitor Auth Status
   *******************************************************/
  onAuthStateChanged(auth, (user) => {
    if (authStatus) {
      authStatus.textContent = user ? `Signed in as ${user.email}` : "Not signed in.";
    }

    if (signOutBtn) {
      signOutBtn.style.display = user ? "inline-block" : "none";
    }

    // Redirect on sign-out
    if (!user && window.location.pathname.includes("schedule.html")) {
      window.location.replace("index.html");
    }

    // Redirect to schedule after sign-in from index
    if (user && (window.location.pathname.includes("index.html") || window.location.pathname === "/")) {
      window.location.href = "schedule.html";
    }
  });
});
