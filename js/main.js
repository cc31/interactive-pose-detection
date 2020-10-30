let capture, poseNet, pose, skeleton;
let poseToMatch = [];
let dotColor, defaultColor, correctColor, skeletonColor;
const recordBtn = document.getElementById('record'), chunks = [];

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
  recordBtn.onclick = e => {
    recorder.stop();
    recordBtn.textContent = 'start recording';
    recordBtn.onclick = record;
  };
  recorder.start();
  recordBtn.textContent = 'stop recording';
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
recordBtn.onclick = record;

function setup() {
  createCanvas(320, 240);
  capture = createCapture(VIDEO);
  capture.size(320, 240);
  capture.hide();

  poseNet = ml5.poseNet(capture, modelReady);
  poseNet.on('pose', gotPoses);

  xToMatch = width/2;
  yToMatch = height/2;
  defaultColor = color(255,65,10,70);
  correctColor = color(0,255,0,255);
  skeletonColor = color(50,168, 145,100);
  dotColor = defaultColor;
}

function gotPoses(poses) {
  console.log(poses);

  if (poses.length > 0){
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelReady() {
  console.log('poseNet model ready');
}

function drawRandomPose(colr){
  poseToMatch = [
    [0,0],//nose
    [0,0],//lefteye
    [0,0],//righteye
    [0,0],//leftear
    [0,0],//rigtear
    [244,170],//leftshoulder
    [80,170],//rightshoulder
    [0,0],//leftelbow
    [0,0],//rightelbow
    [0,0],//leftwrist
    [0,0],//rightwrist
    [0,0],//lefthip
    [0,0],//righthip
    [0,0],//leftknee
    [0,0],//rightknee
    [0,0],//leftankle
    [0,0],//rightankle
  ];
  for (let i=0; i<poseToMatch.length; i++) {
    noStroke();
    fill(colr);
    ellipse(poseToMatch[i][0],poseToMatch[i][1],15,15);
  }

  strokeWeight(20);
  stroke(colr);
  line(poseToMatch[5][0], poseToMatch[5][1],poseToMatch[6][0],poseToMatch[6][1]);

}

function matchPose(x1,y1,x2,y2){
  let d = dist(x1,y1,x2,y2);
  if (d < 20){
    dotColor = correctColor;
    console.log('match');
  } else {
    dotColor = defaultColor;
    console.log('no match');
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
      ellipse(x,y,15,15);

      if (i==5 || i==6) {
        matchPose(x,y,poseToMatch[i][0],poseToMatch[i][1]);
      }
    }

    for (let i = 0; i < skeleton.length; i++){
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(20);
      stroke(skeletonColor);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }

  }
  drawRandomPose(dotColor);
}