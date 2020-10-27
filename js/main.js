let capture;
let poseNet;
let pose;
let skeleton;
let xToMatch = 0;
let yToMatch = 0;
let dotColor, defaultColor, correctColor, skeletonColor;
const btn = document.getElementById('record'), chunks = [];

function record() {
  chunks.length = 0;
  let stream = document.querySelector('canvas').captureStream(30),
    recorder = new MediaRecorder(stream);
  recorder.ondataavailable = e => {
    if (e.data.size) {
      chunks.push(e.data);
    }
  };
  recorder.onstop = exportVideo;
  btn.onclick = e => {
    recorder.stop();
    btn.textContent = 'start recording';
    btn.onclick = record;
  };
  recorder.start();
  btn.textContent = 'stop recording';
}

function exportVideo(e) {
  var blob = new Blob(chunks);
  var vid = document.createElement('video');
  vid.id = 'recorded';
  vid.width = 320;
  vid.height = 240;
  vid.controls = true;
  vid.src = URL.createObjectURL(blob);
  document.body.appendChild(vid);
  vid.play();
}
btn.onclick = record;

function setup() {
  createCanvas(320, 240);
  capture = createCapture(VIDEO);
  capture.size(320, 240);
  capture.hide();

  poseNet = ml5.poseNet(capture, modelReady);
  poseNet.on('pose', gotPoses);

  xToMatch = width/2;
  yToMatch = height/2;
  defaultColor = color('#ff414d');
  correctColor = color('#28df99');
  skeletonColor = color('#a5ecd7');
  dotColor = defaultColor;
}

function gotPoses(poses) {
  // console.log(poses);

  if (poses.length > 0){
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelReady() {
  console.log('poseNet model ready');
}

function drawRandomPose(x,y,clr){
  noStroke();
  fill(clr);
  ellipse(x,y,18,18);
}

function matchPose(x1,y1,x2,y2){
  let d = dist(x1,y1,x2,y2);
  if (d < 10){
    dotColor = correctColor;
  } else {
    dotColor = defaultColor;
  }
}

function draw() {
  translate(capture.width, 0);
  scale(-1, 1);
  image(capture, 0, 0, capture.width, capture.height);

  if (pose) {

    for(let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      noStroke();
      fill(skeletonColor);
      ellipse(x,y,16,16);

      if (i == 0){
        matchPose(x,y,xToMatch,yToMatch);
      }
    }

    for (let i = 0; i < skeleton.length; i++){
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(skeletonColor);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }

  }
  drawRandomPose(xToMatch, yToMatch, dotColor);
}