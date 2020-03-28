import { PerspectiveCamera } from 'three'

export class PCamera {
  constructor ({ base }) {
    let camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000000)

    let resizer = () => {
      camera.aspect = base.getWidth() / base.getHeight()
      camera.updateProjectionMatrix()
    }
    base.onResize(resizer)
    return camera
  }
}