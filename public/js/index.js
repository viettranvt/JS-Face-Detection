const video = document.getElementById("videoElm");

const loadFaceAPI = async () => {
    try{
        await faceapi.nets.faceLandmark68Net.loadFromUri('../../public/libs/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('.../../public/libs/models');
        await faceapi.nets.tinyFaceDetector.loadFromUri('.../../public/libs/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('.../../public/libs/models');
        await faceapi.nets.ageGenderNet.loadFromUri('.../../public/libs/models');
    }catch(e) {
        console.error(e)
    }
};

const getCameraStream = () => {
    try{
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({video: {}})
            .then(stream => {
                video.srcObject =stream
            });
        }
    }catch(e) {
        console.error(e)
    }
};

video.addEventListener("playing", () => {
    try{
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas)
        const displaySize = {
            width: video.videoWidth,
            height: video.videoHeight
        }
    
        setInterval(async () => {
            const detects = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();

            //console.log("detect", detects);
    
            const resizedDetect = faceapi.resizeResults(detects, displaySize);
            canvas.getContext('2d').clearRect(0,0,displaySize.width, displaySize.height);

            faceapi.draw.drawDetections(canvas, resizedDetect)
            //faceapi.draw.drawFaceLandmarks(canvas, resizedDetect)
            faceapi.draw.drawFaceExpressions(canvas, resizedDetect)
            resizedDetect.forEach(result => {
                const { age, gender, genderProbability } = result;
                new faceapi.draw.DrawTextField(
                  [
                    `${Math.round(age)} years`,
                    `${gender} (${(Math.round(genderProbability * 100)/100).toFixed(2)})`
                  ],
                  result.detection.box.bottomRight
                ).draw(canvas);
              });
        }, 300)
    }catch(e) {
        console.error(e)
    }
});

loadFaceAPI().then(getCameraStream);