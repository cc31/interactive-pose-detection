let capture, poseNet, pose, skeleton;
let staticPose, tempKeypoints;
let staticPoseColor, defaultColor, correctColor, skeletonColor;
const recordBtn = document.getElementById('record'), chunks = [];

function record() {
  chunks.length = 0;
  var options = { mimeType: "video/webm; codecs=vp9" };
  let stream = document.querySelector('canvas').captureStream(30),
    recorder = new MediaRecorder(stream, options);
  recorder.ondataavailable = e => {
    if (e.data.size) {
      chunks.push(e.data);
    }
  };
  recorder.onstop = exportVideo;
  recordBtn.onclick = e => {
    recorder.stop();
    recordBtn.textContent = 'Start Recording';
    recordBtn.onclick = record;
  };
  recorder.start();
  recordBtn.textContent = 'Stop Recording';
}

function exportVideo(e) {
  var blob = new Blob(chunks, {
    type: "video/webm"
  });
  var vid = document.createElement('video');
  vid.id = 'recorded';
  vid.width = 500;
  vid.height = 400;
  vid.controls = true;
  vid.src = URL.createObjectURL(blob);
  document.body.appendChild(vid);
  vid.play();
}
recordBtn.onclick = record;

class StaticPose {
  constructor(keypoints) {
    this.keypoints = keypoints;
  }
  show() {
    stroke(staticPoseColor);
    strokeWeight(25);
    var indexArray = [[5,6],[5,7],[5,11],[6,8],[6,12],[7,9],[8,10],[11,12],[11,13],[12,14],[13,15],[14,16]];
    indexArray.forEach(index =>
      line(this.keypoints[index[0]][0], this.keypoints[index[0]][1], this.keypoints[index[1]][0], this.keypoints[index[1]][1]));
  }
}

function matchPose(userPose, staticPose){
  let distances = [];
  for (let i = 5; i < 17; i++) {
    let d = dist(userPose[i].position.x, userPose[i].position.y, staticPose[i][0], staticPose[i][1]);
    distances.push(d);
  }
  let match = distances.every( e => e < 80);
  if (match) {
    staticPoseColor = correctColor;
  } else {
    staticPoseColor = defaultColor;
  }
}

function setup() {
  createCanvas(500, 400);
  capture = createCapture(VIDEO);
  capture.size(500, 400);
  capture.hide();

  poseNet = ml5.poseNet(capture, modelReady);
  poseNet.on('pose', gotPoses);

  xToMatch = width/2;
  yToMatch = height/2;
  defaultColor = color(255,65,10,70);
  correctColor = color(0,255,0,200);
  skeletonColor = color(50,168, 145,70);
  staticPoseColor = defaultColor;

  tempKeypoints = [
    [0,0],//nose
    [0,0],//lefteye
    [0,0],//righteye
    [0,0],//leftear
    [0,0],//rigtear
    [320,60],//leftshoulder
    [180,60],//rightshoulder
    [390,140],//leftelbow
    [110,140],//rightelbow
    [450,220],//leftwrist
    [50,220],//rightwrist
    [300,210],//lefthip
    [200,210],//righthip
    [310,300],//leftknee
    [190,300],//rightknee
    [320,390],//leftankle
    [180,390],//rightankle
  ];
  staticPose = new StaticPose(tempKeypoints);
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
      ellipse(x,y,15,15);
    }
    for (let i = 0; i < skeleton.length; i++){
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(20);
      stroke(skeletonColor);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    matchPose(pose.keypoints, staticPose.keypoints);
  }
  staticPose.show();
}