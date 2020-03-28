import { WebGLRenderer } from "three"

export class Renderer {
  constructor ({ base, makeGIF }) {
    this.base = base
    let renderer = base.renderer = new WebGLRenderer({
      preserveDrawingBuffer: makeGIF,
      antialias: true,
      alpha: true
    })

    // renderer.domElement.style.marginBottom = '-6px'
    base.getWidth = (rect) => {
      if (makeGIF) {
        return 256
      } else if (rect) {
        return rect.width
      } else {
        return window.innerWidth
      }
    }
    base.getHeight = (rect) => {
      if (makeGIF) {
        return 256
      } else if (rect) {
        return rect.height
      } else {
        return window.innerHeight
      }
    }
    base.getDPI = () => {
      if (makeGIF) {
        return 4
      } else {
        return 2
      }
    }

    let resizer = (rect) => {
      let dpi = base.getDPI() // window.devicePixelRatio || 2.0;
      renderer.setSize(base.getWidth(rect), base.getHeight(rect))
      renderer.setPixelRatio(dpi)
    }
    // resizer()
    base.onResize(resizer)

    return renderer
  }
}
