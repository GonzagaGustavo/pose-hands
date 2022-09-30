import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";
import * as fp from "fingerpose";
import { thumbsDownGesture } from './models/ThumbsDown'

function App() {
  const webcamRef = useRef(null);
  const [text, setText] = useState("");

  const runPosenet = async () => {
    const net = await handpose.load();
    console.log("handpose loaded");
    //
    setInterval(() => detect(net), 100);
  };

  const detect = async (net) => {
    

    if (webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      const hands = await net.estimateHands(video);

      if (hands.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
          thumbsDownGesture,
        ]);
        const gesture = await GE.estimate(hands[0].landmarks, 4);
        const confidence = gesture.gestures.map(
          (prediction) => prediction.score
        );
        const maxConfidence = confidence.indexOf(
          Math.max.apply(null, confidence)
        );
        const gestureName = gesture.gestures[maxConfidence].name;
        if (gestureName === "thumbs_up") {
          document.querySelector("body").style.background = "rgb(0, 120, 0)"
          setText("Receita");
        } else if (gestureName === "thumbs_down") {
          document.querySelector("body").style.background = "rgb(120, 0, 0)"
          setText("Despesa");
        } else if(gestureName === "victory") {
          document.querySelector("body").style.background = "rgb(0, 0, 100)"
          setText("Transferencia")
        }
      }
    }
  };
  useEffect(() => {
    runPosenet();
  }, []);
  return (
    <div className="App">
        <Webcam
          ref={webcamRef}
          style={{
            position: 'absolute',
            opacity: 0
          }}
        />
      <h1 className="name">{text}</h1>
    </div>
  );
}

export default App;
