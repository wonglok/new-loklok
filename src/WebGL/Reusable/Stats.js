import Stats3JS from 'stats.js'
export class Stats {
  constructor ({ mounter = document.body } = { mounter: document.body }) {
    var stats = new Stats3JS()
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    mounter.appendChild(stats.dom)
    stats.dom.style.position = 'relative'
    return stats
  }
}