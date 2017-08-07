export default class Game {
  constructor () {
    this.tick = 0

    this._timer = setInterval(() => this.tick++, 100)
  }
}
