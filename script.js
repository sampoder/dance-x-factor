/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
console.log("hi");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  

let START_TIME;

let CURRENT_TIME;

let TOTAL = 0;

let TOTAL_GOOD = 0

let TOTAL_BAD = 0

let TIMER_RUNNING = false;

let COUNTING = false

var URL = "https://teachablemachine.withgoogle.com/models/bbvJtURWa/";
var model, webcam, ctx, labelContainer, maxPredictions;

async function init() {
  var modelURL = URL + "model.json";
  var metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // Note: the pose library adds a tmPose object to your window (window.tmPose)
  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  var size = screen.height - 48 - 76 - 24 - 24 - 24 - 24 - 20;
  var flip = true; // whether to flip the webcam
  webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append/get elements to the DOM
  var canvas = document.getElementById("canvas");
  canvas.width = size;
  canvas.height = size;
  ctx = canvas.getContext("2d");
  labelContainer = document.getElementById("label-container");

  for (let i = 0; i < maxPredictions; i++) {
    // and class labels
    labelContainer.appendChild(document.createElement("div"));
  }
}

function startTheClock() {
  START_TIME = CURRENT_TIME;
  document.getElementById("start").style.display = "none";
  document.getElementById("main").style.display = "block";
  console.log("started the clock");
  TIMER_RUNNING = true;
}

function sanitise(x) {
    if (isNaN(x) && typeof x == 'undefined') {
      return 0;
    }
    return x;
  }

async function loop(timestamp) {
  document.getElementById("start-button").disabled = false;
  CURRENT_TIME = timestamp;
  if (TIMER_RUNNING && COUNTING) {
    TOTAL += 1
    console.log(sanitise((labelContainer.childNodes[0].innerHTML).replace("Good: ", "")))
    TOTAL_GOOD += parseFloat(sanitise((labelContainer.childNodes[0].innerHTML).replace("Good: ", "")))
    TOTAL_BAD += parseFloat(sanitise((labelContainer.childNodes[1].innerHTML).replace("Bad: ", "")))
    document.getElementById("time-title").innerHTML = (
      30 - Math.round((CURRENT_TIME - START_TIME) / 1000)
    ).toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  }
  if (TIMER_RUNNING && CURRENT_TIME - 30000 > START_TIME) {
    console.log("TIMMEEEEE");
    TIMER_RUNNING = false;
    console.log(TOTAL_BAD / TOTAL * 100)
    console.log(TOTAL_GOOD / TOTAL * 100)
    document.getElementById("main").style.display = "none";
    if(TOTAL_BAD / TOTAL * 100 > TOTAL_GOOD / TOTAL * 100){
        document.getElementById("lost").style.display = "block";
        await sleep(2000);
        document.getElementById("lost").style.display = "none";
        document.getElementById("start").style.display = "block";
    }
    else{
        document.getElementById("victory").style.display = "block";
        await sleep(2000);
        document.getElementById("victory").style.display = "none";
        document.getElementById("start").style.display = "block";
    }
    
  }
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  var { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  // Prediction 2: run input through teachable machine classification model
  var prediction = await model.predict(posenetOutput);

  for (let i = 0; i < maxPredictions; i++) {
    var classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;
    
  }
  COUNTING = true
  // finally draw the poses
  drawPose(pose);
}

function drawPose(pose) {
  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0);
    // draw the keypoints and skeleton
    if (pose) {
      var minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  }
}

init();
