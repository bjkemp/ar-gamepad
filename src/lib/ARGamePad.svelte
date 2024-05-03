<script>
  import { onMount, onDestroy } from 'svelte';
  import { GamepadListener } from 'gamepad.js';

  const listener = new GamepadListener(/* options*/);

  listener.discover()

  let connected = false;
  let gamepadStateInterval;
  let udpSocket;

  let selectedGamepadIndex = 0;
  let gamepadId = '';
  let udpIp = 'localhost';
  let udpPort = 8080;

  listener.on('connect', () => {
    console.log('Gamepad connected');
    connected = true;
  });

  listener.on('disconnect', () => {
    console.log('Gamepad disconnected');
    connected = false;
  });

  listener.on('gamepad:button', (e) => {
    console.log('Button event:', e);
  });

  listener.on('gamepad:axis', (e) => {
    console.log('Axis event:', e);
  });


  const connectGamepad = async () => {
    const gamepads = await navigator.getGamepads();
    if (gamepads.length === 0) {
      console.error('No gamepads found!');
      return;
    }

    selectedGamepadIndex = Math.min(selectedGamepadIndex, gamepads.length - 1); // Clamp index

    const gamepad = gamepads[selectedGamepadIndex];

    if (!gamepad) {
      console.error('Gamepad not found!');
      return;
    }

    console.log(`Using gamepad: ${gamepad.id}`); // Joypad doesn't provide product name
    gamepadId = gamepad.id;
    connected = true;

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
    listener.start();
  });

  onDestroy(() => {
    clearInterval(gamepadStateInterval);
    if (udpSocket) udpSocket.close();
  });
</script>

<button on:click={connectGamepad}>Connect</button>

<p>Selected Gamepad Index: {selectedGamepadIndex}</p>
<p>Selected Gamepad ID: {gamepadId}</p>
<p>Connected State: {connected}</p>
<p>UDP IP: {udpIp}</p>
<p>UDP Port: {udpPort}</p>
