<script>
  import { onMount, onDestroy } from 'svelte';
  import 'joypad.js'; // Import Joypad

  let joypad;
  let gamepadStateInterval;
  let udpSocket;

  let selectedGamepadIndex = 0;
  let udpIp = 'localhost';
  let udpPort = 8080;

  const getGamepads = async () => {
    return new Promise((resolve) => {
      const gamepads = joypad.getPressed(); // Get currently pressed gamepads
      resolve(gamepads);
    });
  };

  const connectGamepad = async () => {
    const gamepads = await getGamepads();
    if (gamepads.length === 0) {
      console.error('No gamepads found!');
      return;
    }

    selectedGamepadIndex = Math.min(selectedGamepadIndex, gamepads.length - 1); // Clamp index

    const gamepad = gamepads[selectedGamepadIndex];
    console.log(`Using gamepad: ${gamepad.id}`); // Joypad doesn't provide product name

    udpSocket = new WebSocket(`ws://${udpIp}:${udpPort}`); // Replace with dgram for raw UDP
    udpSocket.onopen = () => console.log('UDP socket connected');
    udpSocket.onerror = (err) => console.error('UDP socket error:', err);

    gamepadStateInterval = setInterval(() => {
      const axes = gamepad.button; // Joypad uses single button object with axes as properties
      const buttons = Object.values(gamepad.button).slice(4); // Extract buttons (excluding axes)
      const data = [axes.left.x, axes.left.y, axes.right.x, axes.right.y].concat(buttons).concat(0xff); // Combine and add null terminator
      udpSocket.send(data);
    }, 100); // Sample rate: 100 milliseconds
  };

  const mapRange = (inMin, inMax, outMin, outMax, value) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  onMount(async () => {
    joypad.init(); // Initialize Joypad library
  });

  onDestroy(() => {
    clearInterval(gamepadStateInterval);
    joypad.stop(); // Stop Joypad polling
    if (udpSocket) udpSocket.close();
  });
</script>

<button on:click={connectGamepad}>Connect Gamepad</button>

<p>Selected Gamepad Index: {selectedGamepadIndex}</p>
<p>UDP IP: {udpIp}</p>
<p>UDP Port: {udpPort}</p>
