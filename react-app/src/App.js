import Selecto from "react-selecto";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { useState, useEffect, useMemo } from "react";
import "./App.css";

// var mqtt = require("mqtt");
// var client = mqtt.connect("ws://test.mosquitto.org:8081");

const numPoints = 24;
const circleOrigin = [250, 250];
const circleRadius = 200;
const pixelWidth = 20;
const pixelHeight = 20;

function hexToRGB(h) {
  let r = 0,
    g = 0,
    b = 0;

  // 3 digits
  if (h.length === 4) {
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];

    // 6 digits
  } else if (h.length === 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  }

  return { r: +r, g: +g, b: +b };
}

function App() {
  const [pixels, setPixels] = useState([]);
  const [inputColor, setInputColor] = useState("ff0000");
  const [mqttBroker, setMqttBroker] = useState("test.mosquitto.org");
  const [mqttPort, setMqttPort] = useState(8081);
  const [mqttTopic, setMqttTopic] = useState("ceid-workshop");

  useEffect(() => {
    // maths
    const pointsOnTheCircle = new Array(numPoints)
      .fill(undefined)
      .map((v, i) => {
        const x =
          circleOrigin[0] +
          circleRadius * Math.cos(((2 * Math.PI) / numPoints) * i) -
          pixelWidth;
        const y =
          circleOrigin[1] +
          circleRadius * Math.sin(((2 * Math.PI) / numPoints) * i) -
          pixelHeight;
        return {
          x,
          y,
          id: i,
          selected: true,
          color: "ff0000",
        };
      });
    setPixels(pointsOnTheCircle);
  }, []);

  const payload = useMemo(() => {
    const red = pixels.map((p) => hexToRGB(p.color).r);
    const green = pixels.map((p) => hexToRGB(p.color).g);
    const blue = pixels.map((p) => hexToRGB(p.color).b);

    return {
      red,
      green,
      blue,
    };
  }, [pixels]);

  return (
    <div className="App">
      <Selecto
        // The container to add a selection element
        container={document.querySelector("#neopixels")}
        keyContainer={document.querySelector("#neopixels")} // The area to drag selection element (default: container)
        dragContainer="#neopixels"
        // Targets to select. You can register a queryselector or an Element.
        selectableTargets={[".pixel"]}
        // Whether to select by click (default: true)
        selectByClick={true}
        // Whether to select from the target inside (default: true)
        selectFromInside={true}
        // After the select, whether to select the next target with the selected target (deselected if the target is selected again).
        continueSelect={false}
        // Determines which key to continue selecting the next target via keydown and keyup.
        toggleContinueSelect={"shift"}
        // The rate at which the target overlaps the drag area to be selected. (default: 100)
        hitRate={50}
        onSelect={(e) => {
          const copyPixels = [...pixels];
          copyPixels.forEach((v, i) => {
            copyPixels[i].selected = false;
          });
          e.selected.forEach((el) => {
            const id = +el.getAttribute("id");
            copyPixels[id].selected = true;
          });
          setPixels(copyPixels);
        }}
      />

      <div
        style={{
          display: "flex",
        }}
      >
        {/* first column */}
        <div
          style={{
            marginRight: "50px",
          }}
        >
          <h1>Neopixels</h1>
          <div id="neopixels">
            {pixels?.map((p, i) => {
              return (
                <div
                  id={p.id}
                  key={i}
                  className={`pixel ${pixels[i].selected ? "selected" : ""}`}
                  style={{
                    top: p.y + pixelHeight / 2,
                    left: p.x + pixelWidth / 2,
                    width: pixelWidth,
                    height: pixelHeight,
                    backgroundColor: p.color,
                  }}
                ></div>
              );
            })}
          </div>
        </div>
        {/* second column */}
        <div
          style={{
            marginRight: "50px",
          }}
        >
          {/* top */}
          <div>
            <h1>Color picker</h1>
            <HexColorPicker
              onChange={(newColor) => {
                const copyPixels = [...pixels];
                copyPixels.forEach((p) => {
                  if (p.selected) {
                    p.color = newColor;
                  }
                });
                setPixels(copyPixels);
                setInputColor(newColor);
              }}
            />
            <br />
            <HexColorInput
              color={inputColor}
              onChange={(newColor) => setInputColor(newColor)}
            />
            {JSON.stringify(hexToRGB(inputColor))}
          </div>
          {/* bottom */}
          <h1>Payload</h1>
          <textarea
            readOnly
            value={JSON.stringify(payload, null, 2)}
          ></textarea>
        </div>
        {/* third column */}
        <div>
          <h2>Submit payload over MQTT</h2>
          <h3>Broker</h3>
          <input
            disabled
            type="text"
            value={mqttBroker}
            onChange={(e) => setMqttBroker(e.currentTarget.value)}
          ></input>
          <h3>Port</h3>
          <input
            disabled
            type="text"
            value={mqttPort}
            onChange={(e) => setMqttPort(e.currentTarget.value)}
          ></input>
          <h3>Topic</h3>
          <input
            type="text"
            value={mqttTopic}
            onChange={(e) => setMqttTopic(e.currentTarget.value)}
          ></input>
          <button
            // onClick={() => client.publish(mqttTopic, JSON.stringify(payload))}
            type="button"
            style={{
              marginTop: "30px",
              display: "block",
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
