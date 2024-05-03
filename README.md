# AR Gamepad

This project provides a Svelte component that reads data from a joystick and transmits it over a UDP socket to a receiving program. It offers a user interface for selecting the joystick, setting the destination IP and port, and visualizing the transmitted data.

### Features

* User interface for joystick selection, IP/port configuration, and data display.
* Uses `joypad.js` library for joystick access.
* Transmits axes (mapped to 0-255 range) and buttons as binary values.
* Includes a null terminator at the end of the data packet.
* Configurable sample rate for data transmission.

### Installation

1. **Prerequisites:** Ensure you have Node.js and npm (or pnpm) installed.
2. **Clone the repository:** Use `git clone https://github.com/bjkemp/ar-gamepad` to clone this project.
3. **Install dependencies:** Navigate to the project directory and run `npm install` (or `pnpm install`) to install required packages.

### Usage

1. **Start the development server:** Run `npm run dev` (or `pnpm run dev`) to start the development server, usually accessible at `http://localhost:5173/`.
2. **Select joystick and configure:** Use the UI to select the desired joystick and enter the destination IP address and port number.
3. **Control:** Move the joystick axes and buttons to send data. The sent data will be displayed in the component.
4. **Exit:** Close the browser tab or terminal window to stop the development server.
