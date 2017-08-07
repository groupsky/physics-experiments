const { abs, min, PI, floor, sign } = Math
const EPS = 0.0001
/**
 * Gravitational constant (m^3/kg.s)
 * @type {number}
 */
const G = 6.67408 * 1e-11

function sqr (x) { return x * x }

export default class Game {
  constructor () {
    this.state = {
      planet: {
        angularPosition: 0,
        angularVelocity: 0,
        angularAcceleration: 0,
        /** kg.m^2 */
        inertia: 40000,
        /** kg */
        mass: 100000000,
        /** m */
        radius: 100,
      },
      ball: {
        /** m **/
        position: 0,
        /** m/s **/
        velocity: 0,
        /** m/s^2 **/
        acceleration: 0,
        /** N **/
        force: 0,
        /** m **/
        height: 0,
        /** rad **/
        angularPosition: 0,
        /** rad/s **/
        angularVelocity: 0,
        /** rad/s^2 **/
        angularAcceleration: 0,
        /** kg.m^2 */
        inertia: 400,
        /** N.m **/
        torque: 0,
        /** kg */
        mass: 1000,
        /** m */
        radius: 1,
      },
      staticFriction: 1,
      kineticFriction: 0.85,
      lastTick: 0,
      ballTorque: 1,
      sliding: false,
      airborn: false,
    }

    this._timer = setInterval(() => this.tick(), 100)
  }

  tick () {
    const now = new Date().getTime()
    const t = min(0.001, now - this.state.lastTick)
    this.state.lastTick = now

    const oldState = {
      planet: { ...this.state.planet },
      ball: { ...this.state.ball },
    }

    // inertia update
    this.state.ball.intertia = 2 / 5 * oldState.ball.mass * sqr(oldState.ball.radius)
    // normal force
    const forceNormal = G * this.state.ball.mass * this.state.planet.mass / sqr(oldState.ball.radius + oldState.ball.height + oldState.planet.radius)
    // net torque
    this.state.ball.torque = this.state.ballTorque
    this.state.ball.force = 0
    if (oldState.ball.height <= EPS) {
      // if touching ground, we have traction
      this.state.airborn = false
      const velocity = oldState.ball.angularVelocity * oldState.ball.radius
      // if we are not slipping, we have static friction
      if (abs(oldState.ball.velocity - velocity) < EPS) {
        // not slipping
        this.state.sliding = false
        const maxFriction = this.state.staticFriction * forceNormal
        const forceTranslate = this.state.ball.torque * oldState.ball.radius * oldState.ball.mass / oldState.ball.inertia
        this.state.ball.force = min(forceTranslate, maxFriction)
      } else {
        // slipping
        this.state.sliding = true
        // force generated from friction between ball and planet
        const forceFriction = this.state.kineticFriction * forceNormal * sign(velocity - oldState.ball.velocity)
        this.state.ball.torque += -forceFriction * oldState.ball.radius
        this.state.ball.force += forceFriction
        // this also generates torque on the planet
      }
    } else {
      // we're not touching ground, so applied torque is all we need to look at
      this.state.airborn = false
    }
    this.state.ball.angularAcceleration = oldState.ball.torque / oldState.ball.inertia
    this.state.ball.angularVelocity += oldState.ball.angularAcceleration * t
    this.state.ball.angularPosition += (oldState.ball.angularVelocity * t) % 1
    this.state.ball.acceleration = oldState.ball.force / oldState.ball.mass
    this.state.ball.velocity += oldState.ball.acceleration * t
    this.state.ball.position += oldState.ball.velocity * t
  }
}
