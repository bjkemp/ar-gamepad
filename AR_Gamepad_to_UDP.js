// Joystick and Socket handling - Node.js version
// Inspired by the Python script and adapted for Node.js

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const gamepad = require('gamepad');
const dgram = require('dgram');

// Initialize gamepad library
gamepad.init();

// Function to map a value from one range to another
const mapRange = (value, inMin, inMax, outMin, outMax) => {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
};

// Check for connected gamepads
const getGamepadCount = () => {
  return gamepad.numDevices();
};

// Get gamepad details
const getGamepadInfo = (index) => {
  return gamepad.deviceAtIndex(index);
};

// Main function
const main = async () => {
  // Check if any gamepads are connected
  if (getGamepadCount() === 0) {
    console.log("\nNo controllers have been detected! What's up with that? Exiting...");
    process.exit();
  }

  // List available gamepads
  console.log("\nAvailable Controllers: ");
  for (let i = 0; i < getGamepadCount(); i++) {
    const gamepadInfo = getGamepadInfo(i);
    console.log(`${i}: ${gamepadInfo.description}`);
  }

  // Get user input for desired gamepad
  const selectedGamepadIndex = await new Promise((resolve) => {
    readline.question('\nEnter the number of the controller you would like to use: ', resolve);
  });

  // Initialize UDP socket
  const udpSocket = dgram.createSocket('udp4');

  // Get user input for destination IP and port
  const udpIp = await new Promise((resolve) => {
    readline.question('Enter the destination IP address: ', resolve);
  });
  const udpPort = await new Promise((resolve) => {
    readline.question('Enter the destination port number: ', resolve);
  });

  console.log("Starting... Press Ctrl+C to quit.");

  // Sample rate for gamepad data
  const sampleRate = 100; // milliseconds

  // Gamepad data processing loop
  setInterval(() => {
    // Read gamepad state
    gamepad.processEvents();
    const gamepadState = getGamepadInfo(selectedGamepadIndex).state;

    // Extract axes and map their values to 0-255 range
    const axes = gamepadState.axes.map((axisValue) => Math.round(mapRange(axisValue, -1, 1, 0, 255)));

    // Extract button values (already binary)
    const buttons = gamepadState.buttons.map((button) => button.pressed ? 1 : 0);

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
    process.exit();
  });
};

// Run the main function
main();