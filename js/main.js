let video;
let poseNet;
let pose;
let skeleton;
let xToMatch = 0;
let yToMatch = 0;
let dotColor;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', gotPoses);
  xToMatch = width/2;
  yToMatch = height/2;
  dotColor = color('#ff414d');
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
  ellipse(x,y,16,16);
}

function matchPose(x1,y1,x2,y2){
  let d = dist(x1,y1,x2,y2);
  if (d < 10){
    console.log('match');
    dotColor = color('#28df99');
  } else {
    console.log('no match');
    dotColor = color('#ff414d');
  }
}

function draw() {
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {

    for(let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      noStroke();
      fill('#a5ecd7');
      ellipse(x,y,16,16);

      if (i == 0){
        matchPose(x,y,xToMatch,yToMatch);
      }
    }

    for (let i = 0; i < skeleton.length; i++){
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke('#a5ecd7');
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }

  }
  drawRandomPose(xToMatch, yToMatch, dotColor);
}