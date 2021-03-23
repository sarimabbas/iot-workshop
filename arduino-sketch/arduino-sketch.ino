

// Neopixel imports
#include <Adafruit_NeoPixel.h>

// WiFi imports
#include <SPI.h>
#include <WiFi101.h>

// MQTT imports
#include <ArduinoMqttClient.h>

// JSON parser
#include <ArduinoJson.h>

// Neopixel setup
// Which pin on the Arduino is connected to the NeoPixels?
#define PIN        10 // On Trinket or Gemma, suggest changing this to 1
// How many NeoPixels are attached to the Arduino?
#define NUMPIXELS 24 // Popular NeoPixel ring size
// When setting up the NeoPixel library, we tell it how many pixels,
// and which pin to use to send signals. Note that for older NeoPixel
// strips you might need to change the third parameter -- see the
// strandtest example for more information on possible values.
Adafruit_NeoPixel pixels(NUMPIXELS, PIN, NEO_GRB + NEO_KHZ800);

// WiFi setup
int status = WL_IDLE_STATUS;     // the WiFi radio's status
WiFiClient wifiClient;

// MQTT setup
const char broker[] = "test.mosquitto.org";
int        port     = 1883;
const char topic[]  = "ceid-workshop/simple";
MqttClient mqttClient(wifiClient);

void setup() {

  // serial port
  Serial.begin(9600);

  // Neopixels
  Serial.println("Starting Neopixels...");
  pixels.begin(); 
  resetNeopixels();

  // connect to wifi
  WiFi.setPins(8,7,4,2);
  while (WiFi.begin("yale wireless") != WL_CONNECTED) {
    // failed, retry
    Serial.print(".");
    delay(5000);
  }
  Serial.println("You're connected to the network");
  printWiFiData();
  printCurrentNet();
  Serial.println();
 
  // connect to mqtt
  Serial.print("Attempting to connect to the MQTT broker: ");
  Serial.println(broker);
  if (!mqttClient.connect(broker, port)) {
    Serial.print("MQTT connection failed! Error code = ");
    Serial.println(mqttClient.connectError());
    while (1);
  }
  Serial.println("You're connected to the MQTT broker!");
  Serial.println();

  // connect to mqtt topic
  Serial.print("Subscribing to topic: ");
  Serial.println(topic);
  Serial.println();
  mqttClient.subscribe(topic);
  // topics can be unsubscribed using:
  // mqttClient.unsubscribe(topic);
  Serial.print("Waiting for messages on topic: ");
  Serial.println(topic);
  Serial.println();
}

void loop() {
  
  // mqtt
  int messageSize = mqttClient.parseMessage();

  // if message received
  
  if (messageSize) {
    StaticJsonDocument<2048> doc;
    DeserializationError err = deserializeJson(doc, mqttClient);
    if (err) { defaultNeopixels(); resetNeopixels(); return; }

    // find RGB 
    JsonArray red = doc["red"];
    JsonArray green = doc["green"];
    JsonArray blue = doc["blue"];
    lightNeopixels(red, green, blue);
    
//    for(int i = 0; i < red.size(); i++) {
//      Serial.print(red[i].as<int>());
//    }


    // light neo
    delay(200);
    resetNeopixels();
  }
  

  delay(500);
}

void resetNeopixels() {
  pixels.clear();
  for (int i = 0; i < NUMPIXELS; i++) {
    pixels.setPixelColor(i, pixels.Color(0, 0, 0));
    pixels.show();
  }
}

void defaultNeopixels() {
  // turn on the pixels
  for (int i = 0; i < NUMPIXELS; i++) {
    pixels.setPixelColor(i, pixels.Color(150, 0, 150));
    pixels.show();
    delay(50); // Pause before next pass through loop
  }
}

void lightNeopixels(JsonArray red, JsonArray green, JsonArray blue) {
  for (int i = 0; i < red.size(); i++) {
    pixels.setPixelColor(i, pixels.Color(red[i].as<int>(), green[i].as<int>(), blue[i].as<int>()));
    pixels.show();
    delay(50); // Pause before next pass through loop
  }
}


void printWiFiData() {
  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
  Serial.println(ip);

  // print your MAC address:
  byte mac[6];
  WiFi.macAddress(mac);
  Serial.print("MAC address: ");
  printMacAddress(mac);

  // print your subnet mask:
  IPAddress subnet = WiFi.subnetMask();
  Serial.print("NetMask: ");
  Serial.println(subnet);

  // print your gateway address:
  IPAddress gateway = WiFi.gatewayIP();
  Serial.print("Gateway: ");
  Serial.println(gateway);
}

void printCurrentNet() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print the MAC address of the router you're attached to:
  byte bssid[6];
  WiFi.BSSID(bssid);
  Serial.print("BSSID: ");
  printMacAddress(bssid);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.println(rssi);

  // print the encryption type:
  byte encryption = WiFi.encryptionType();
  Serial.print("Encryption Type:");
  Serial.println(encryption, HEX);
}

void printMacAddress(byte mac[]) {
  for (int i = 5; i >= 0; i--) {
    if (mac[i] < 16) {
      Serial.print("0");
    }
    Serial.print(mac[i], HEX);
    if (i > 0) {
      Serial.print(":");
    }
  }
  Serial.println();
}
