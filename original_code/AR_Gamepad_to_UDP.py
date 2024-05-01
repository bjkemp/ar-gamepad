# Joystick and Socket handling written by ChatGPT
# Conceptualized, corrected, and modified by Adam Kemp, 2024
# V1 - Completed basic joystick to UDP funcitonality

from numpy import interp # So we can use the Arduino's "map()" command. Not sure how else to do it in Python.
import time # Allows us to slow down the transmit rate

# Package needed to handle joysticks
import pygame

# Package needed to handle UDP communication
import socket

# Initialize pygame
pygame.init()
pygame.joystick.init()

# The sample rate for joystick data
samplerate = 0.1 # In s

# Check to see if any joysicks are available
if(pygame.joystick.get_count() == 0):
    # If not, close the program
    print("\nNo controllers have been detected! What's up with that? Exiting...")
    pygame.joystick.quit()
    pygame.quit()
    quit()

# Create a list of joysticks
print("\nAvailable Controllers: ")
for i in range (pygame.joystick.get_count()):
    tempJoy = pygame.joystick.Joystick(i)
    tempJoy.init()
    print(str(i) + ": " + str(tempJoy.get_name()))
    tempJoy.quit()

# Initialize joystick
sel = input("\nEnter the number of the controller you would like to use: ")
joystick = pygame.joystick.Joystick(int(sel))
joystick.init()

# Initialize UDP socket
UDP_IP = input("Enter the destination IP address: ")  # Change this to the IP address of the receiver
UDP_PORT = int(input("Enter the destination port number: "))
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

print("Starting... Press ctrl+c to quit.")
time.sleep(1)

try:
    while True:
        # Get events
        pygame.event.pump()

        # Get joystick axes and buttons, then map each range to something the Arduino can use, like 0-255
        axes = [int(interp(joystick.get_axis(i),[-1.0,1.0],[0,255])) for i in range(joystick.get_numaxes())]
        # Get button values. These are binary, so no mapping is needed
        buttons = [joystick.get_button(i) for i in range(joystick.get_numbuttons())]
        
        # Combine axes and buttons into a single list
        data = axes + buttons
        data.append(0xff) # Add a null to the end of the list
        print(data)

        # Convert data to bytes
        data_bytes = bytes(data)

        # Send data over UDP
        sock.sendto(data_bytes, (UDP_IP, UDP_PORT))

        #Set the sample rate
        time.sleep(samplerate)

except KeyboardInterrupt:
    print("Exiting...")
    joystick.quit()
    pygame.quit()
