const { abs, min, PI, floor, sign, sqrt } = Math
const EPS = 0.0001
/**
 * Gravitational constant (m^3/kg.s)
 * @type {number}
 */
const G = 6.67408 * 1e-11

function sqr (x) { return x * x }

export default class Game {
  constructor () {
    this.const = {
      planet: {
        /** kg.m^2 */
        inertia: 40000,
        /** kg */
        mass: 100000000,
        /** m */
        radius: 100,
      },
      ball: {
        /** kg.m^2 */
        inertia: 400,
        /** kg */
        mass: 1000,
        /** m */
        radius: 1,
      },
      staticFriction: 1,
      kineticFriction: 0.85,
      engineTorque: 1,
      minHeight: 0,
    }
    this.state = {
      planet: {
        angularPosition: 0,
        angularVelocity: 0,
        angularAcceleration: 0,
      },
      ball: {
        /** m **/
        positionX: 0,
        /** m **/
        positionY: 0,
        /** m/s **/
        velocityX: 0,
        /** m/s **/
        velocityY: 0,
        /** m/s^2 **/
        accelerationX: 0,
        /** m/s^2 **/
        accelerationY: 0,
        /** N **/
        forceX: 0,
        /** N **/
        forceY: 0,
        /** rad **/
        angularPosition: 0,
        /** rad/s **/
        angularVelocity: 0,
        /** rad/s^2 **/
        angularAcceleration: 0,
        /** N.m **/
        torque: 0,
      },
      lastTick: 0,
      sliding: false,
      airborn: false,
      forceNormal: 0,
    }

    this.prepareConsts()
    // this._timer = setInterval(() => this.tick(), 100)
  }

  prepareConsts () {
    this.const.planet.inertia = 2 / 5 * this.const.planet.mass * sqr(this.const.planet.radius)
    this.const.ball.inertia = 2 / 5 * this.const.ball.mass * sqr(this.const.ball.radius)
    this.const.minHeight = this.const.planet.radius + this.const.ball.radius
  }

  sim (oldState, t) {
    const newState = {
      planet: {
        angularPosition: oldState.planet.angularPosition,
        angularVelocity: oldState.planet.angularVelocity,
        angularAcceleration: 0,
      },
      ball: {
        /** m **/
        positionX: oldState.ball.positionX,
        /** m **/
        positionY: oldState.ball.positionY,
        /** m/s **/
        velocityX: oldState.ball.velocityX,
        /** m/s **/
        velocityY: oldState.ball.velocityY,
        /** m/s^2 **/
        accelerationX: 0,
        /** m/s^2 **/
        accelerationY: 0,
        /** N **/
        forceX: 0,
        /** N **/
        forceY: 0,
        /** rad **/
        angularPosition: oldState.ball.angularPosition,
        /** rad/s **/
        angularVelocity: oldState.ball.angularVelocity,
        /** rad/s^2 **/
        angularAcceleration: 0,
        /** N.m **/
        torque: 0,
      },
      sliding: false,
      airborn: false,
      forceNormal: 0,
      forceFriction: 0,
    }

    const dist2 = sqr(oldState.ball.positionX) + sqr(oldState.ball.positionY)
    // normal force
    newState.forceNormal = G * this.const.ball.mass * this.const.planet.mass / (dist2)
    // engine torque
    newState.ball.torque += this.const.engineTorque

    // friction between ball and planet
    if (!oldState.airborn) {
      const velocityP = oldState.ball.angularVelocity * oldState.ball.radius
      if (oldState.sliding) {
        newState.forceFriction += this.const.kineticFriction * newState.forceNormal * sign(velocityP - oldState.ball.positionX)
      }
      // // if we are not slipping, we have static friction
      // if (abs(oldState.ball.velocityX - velocity) < EPS) {
      //   // not slipping
      //   this.state.sliding = false
      //   const maxFriction = this.state.staticFriction * forceNormal
      //   const forceTranslate = this.state.ball.torque * oldState.ball.radius * oldState.ball.mass / oldState.ball.inertia
      //   this.state.ball.forceX = min(forceTranslate, maxFriction)
      // } else {
      //   // slipping
      //   this.state.sliding = true
      //   // force generated from friction between ball and planet
      //   const forceFriction = this.state.kineticFriction * forceNormal * sign(velocity - oldState.ball.velocityX)
      //   this.state.ball.torque += -forceFriction * oldState.ball.radius
      //   this.state.ball.forceX += forceFriction
      //   // this also generates torque on the planet
      // }
    } else {
      // we're not touching ground, so applied torque is all we need to look at
      this.state.airborn = false
    }

    // gravity
    newState.ball.forceX += -oldState.ball.positionX * newState.forceNormal / dist2
    newState.ball.forceY += -oldState.ball.positionY * newState.forceNormal / dist2

    // rotational ball sim
    newState.ball.angularAcceleration = newState.ball.torque / this.const.ball.inertia
    newState.ball.angularVelocity = oldState.ball.angularVelocity + newState.ball.angularAcceleration * t
    newState.ball.angularPosition = (oldState.ball.angularPosition + oldState.ball.angularVelocity * t) % 1
    // rotational planet sim
    newState.planet.angularAcceleration = newState.planet.torque / this.const.planet.inertia
    newState.planet.angularVelocity = oldState.planet.angularVelocity + newState.planet.angularAcceleration * t
    newState.planet.angularPosition = (oldState.planet.angularPosition + oldState.planet.angularVelocity * t) % 1
    // translational ball sim
    newState.ball.accelerationX = oldState.ball.forceX / oldState.ball.mass
    this.state.ball.velocityX += oldState.ball.accelerationX * t
    this.state.ball.positionX += oldState.ball.velocityX * t
    newState.airborn = sqrt(sqr(newState.ball.positionX) + sqr(newState.ball.positionY)) - this.const.planet.radius - this.const.ball.radius > EPS
    newState.sliding = newState.airborn || (newState.angularVelocity * this.const.ball.radius)

    return newState
  }

  tick () {
    const now = new Date().getTime()
    const t = min(0.001, now - this.state.lastTick)
    this.state.lastTick = now

    const oldState = {
      planet: { ...this.state.planet },
      ball: { ...this.state.ball },
    }

    const newState = this.sim(oldState, t)
    this.state.planet = newState.planet
    this.state.ball = newState.ball
    this.state.sliding = newState.sliding
    this.state.airborn = newState.airborn
  }
}
