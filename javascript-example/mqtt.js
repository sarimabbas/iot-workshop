var client = mqtt.connect("wss://test.mosquitto.org:8081"); // you add a ws:// url here

setInterval(() => {
  client.publish("ceid-workshop", "hello world!");
}, 5000);
