import * as d3 from "d3"


function main() {

  const video = document.querySelector('video')
  const canvas = document.querySelector('canvas')

  navigator
    .mediaDevices
    .getUserMedia({audio: false, video: true})
    .then((stream) => {
      video.srcObject = stream
      video.onloadedmetadata = (e) => video.play()
    })
    .catch((error) => {
      console.log(error)
    })
}

window.onload = function () {
  main()
}
