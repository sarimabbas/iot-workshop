import paho.mqtt.client as mqtt 
from random import randrange, uniform
import time

mqttBroker ="test.mosquitto.org" 

client = mqtt.Client("eklfewkjlfhewkfhwj")
client.connect(mqttBroker) 

while True:
    client.publish("ceid-workshop", "blah blah")
    time.sleep(5)