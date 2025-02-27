var menu_btn = document.querySelector("#menu-btn");
var sidebar = document.querySelector("#sidebar");
var container = document.querySelector(".my-container");
menu_btn.addEventListener("click", () => {
  sidebar.classList.toggle("active-nav");
  container.classList.toggle("active-cont");
});
const callHistoryContainer = document.getElementById("call-history");
const lastFiveContainer = document.getElementById("last-five-calls"); // Container for last 5 calls
let rollCounter = 1;
const lastFiveCalls = []; // Array to store the last 5 calls

// Define colors for each letter range
const letterColors = {
  B: "green",   // For numbers 1–15
  I: "orange",  // For numbers 16–30
  N: "purple",  // For numbers 31–45
  G: "blue",    // For numbers 46–60
  O: "red"      // For numbers 61–75
};

// Method to add a new number to the call history
function addNumber(number) {
  if (number < 1 || number > 75) {
    console.error("Invalid number: Bingo numbers must be between 1 and 75.");
    return;
  }

  // Determine the letter and color based on the number range
  let letter = "";
  let color = "";
  if (number >= 1 && number <= 15) {
    letter = "B";
    color = letterColors.B;
  } else if (number >= 16 && number <= 30) {
    letter = "I";
    color = letterColors.I;
  } else if (number >= 31 && number <= 45) {
    letter = "N";
    color = letterColors.N;
  } else if (number >= 46 && number <= 60) {
    letter = "G";
    color = letterColors.G;
  } else if (number >= 61 && number <= 75) {
    letter = "O";
    color = letterColors.O;
  }

  // Add to call history
  const numberWrapper = document.createElement("div");
  numberWrapper.className = "number-wrapper";

  // Add roll number
  const rollNumberDiv = document.createElement("div");
  rollNumberDiv.className = "roll-number";
  rollNumberDiv.textContent = rollCounter++;
  numberWrapper.appendChild(rollNumberDiv);

  // Add colored circle with letter + number
  const numberDiv = document.createElement("div");
  numberDiv.className = `history-number-circle ${color}`;
  numberDiv.textContent = `${letter}${number}`;
  numberWrapper.appendChild(numberDiv);

  // Prepend to history to show most recent first
  callHistoryContainer.prepend(numberWrapper);

  // Update the last 5 calls
  updateLastFive(`${letter}${number}`, color);
}

// Method to update the last 5 calls
function updateLastFive(call, color) {
  // Add the new call to the beginning of the array
  lastFiveCalls.unshift({ call, color });

  // Ensure the array contains at most 5 items
  if (lastFiveCalls.length > 5) {
    lastFiveCalls.pop();
  }

  // Clear the last five container
  lastFiveContainer.innerHTML = "";

  // Render the last 5 calls
  lastFiveCalls.forEach(item => {
    const callDiv = document.createElement("div");
    callDiv.className = `history-number-circle ${item.color}`;
    callDiv.textContent = item.call;
    lastFiveContainer.appendChild(callDiv);
  });
}

// Method to clear the call history
function clearNumberHistory() {
  callHistoryContainer.innerHTML = "";
  lastFiveContainer.innerHTML = "";
  rollCounter = 1; // Reset roll counter
  lastFiveCalls.length = 0;
  console.log(callHistoryContainer.innerHTML);
  console.log(lastFiveContainer.innerHTML);
  console.log(rollCounter);
}
