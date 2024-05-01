const { createInterface } = require('readline');
const { createSocket } = require('dgram');
const { GamepadAPI } = require('gamepad-api');

// Initialize Gamepad API
const gamepadAPI = new GamepadAPI();

// Function to map a value from one range to another
const mapRange = (value, inMin, inMax, outMin, outMax) => {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
};

// Get available gamepads (promise-based)
const getGamepads = async () => new Promise((resolve) => {
  gamepadAPI.on('connect', (gamepad) => resolve([gamepad])); // Resolve with an array containing the connected gamepad
});

// Get gamepad details
const getGamepadInfo = (gamepad) => gamepad; // GamepadAPI already provides details

// Main function
const main = async () => {
  // Wait for gamepad connection
  const gamepads = await getGamepads();

  // Check if any gamepads are connected
  if (gamepads.length === 0) {
    console.log("\nNo controllers have been detected! Exiting...");
    process.exit();
  }

  // List available gamepads
  console.log("\nAvailable Controllers: ");
  gamepads.forEach((gamepad) => console.log(`${gamepad.id}: ${gamepad.detail.productName}`));

  // Create readline interface
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Get user input for desired gamepad
  const selectedGamepadIndex = await new Promise((resolve) => {
    readline.question('\nEnter the number of the controller you would like to use: ', resolve);
  });

  // Validate and convert user input to a number
  const selectedGamepadIndexNum = parseInt(selectedGamepadIndex, 10);
  if (selectedGamepadIndexNum < 0 || selectedGamepadIndexNum >= gamepads.length) {
    console.log("Invalid gamepad selection. Exiting...");
    process.exit();
  }
  const selectedGamepad = gamepads[selectedGamepadIndexNum];

  // Initialize UDP socket
  const udpSocket = createSocket('udp4');

  // Get user input for destination IP and port
  const udpIp = await new Promise((resolve) => {
    readline.question('Enter the destination IP address: ', resolve);
  });
  const udpPort = parseInt(await new Promise((resolve) => {
    readline.question('Enter the destination port number: ', resolve);
  }), 10);

  console.log("Starting... Press Ctrl+C to quit.");

  // Sample rate for gamepad data
  const sampleRate = 100; // milliseconds

  // Gamepad data processing loop
  setInterval(() => {
    // Get gamepad state (no need for processEvents)
    const gamepadState = selectedGamepad.getGamepad();

    // Extract axes and map their values to 0-255 range
    const axes = gamepadState.axes.map((axisValue) => Math.round(mapRange(axisValue, -1, 1, 0, 255)));

    // Extract button values (already binary)
    const buttons = gamepadState.buttons.map((button) => button.value);

    // Combine axes and buttons into a single data array
    const data = axes.concat(buttons);
    data.push(0xff); // Add null terminator

    console.log(data);

    // Send data over UDP
    const message = Buffer.from(data);
    udpSocket.send(message, 0, message.length, udpPort, udpIp);
  }, sampleRate);

  // Handle Ctrl+C to exit
  process.on('SIGINT', () => {
    console.log("Exiting...");
    readline.close(); // Close readline interface
    udpSocket.close();
    process.exit();
  });
};

// Run the main function
main();
