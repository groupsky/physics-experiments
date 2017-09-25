const { random, floor, min, max, log, PI } = Math

/**
 * @type {number} Gravity acceleration (m/s2)
 */
const GRAVITY = 9.80665
/**
 * @see http://www.engineeringtoolbox.com/stp-standard-ntp-normal-air-d_772.html
 * @type {number} Air density at normal temperature and pressure (kg/m3)
 */
const AIR_DENSITY = 1.204

const HP_TO_NM_COEF = 5252

/**
 * Number of kilometers in 1 mile
 * @type {number}
 */
const KM_PER_MILE = 1.609344

const RADIANS_IN_REVOLUTION = 2 * PI

const SECONDS_IN_MINUTE = 60

const MINUTES_IN_HOUR = 60

const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * MINUTES_IN_HOUR

const METERS_IN_KM = 1000

const WATTS_IN_HP = 745.699872

/**
 * Calculates square of a number
 * @param {number} a number to square
 * @returns {number} square of a
 */
function sqr (a) {
  return a * a
}

/**
 * Calculate the centripetal acceleration of a body
 * @param {number} velocity tangential velocity (m/s)
 * @param {number} radius radius of curvature (m)
 * @returns {number} centripetal force (N)
 */
function centripetalAcceleration (velocity, radius) {
  return sqr(velocity) / radius
}

/**
 * Calculate the centripetal force acting on a body
 * @param {number} mass mass (kg)
 * @param {number} velocity tangential velocity (m/s)
 * @param {number} radius radius of curvature (m)
 * @returns {number} centripetal force (N)
 */
function centripetalForce (mass, velocity, radius) {
  return mass * centripetalAcceleration(velocity, radius)
}

/**
 * Calculate the radius of a curve given the angle and length
 * @param {number} angle in radians
 * @param {number} length in meters
 * @returns {number} radius in meters
 */
function radiusOfCurve (angle, length) {
  return length / angle
}

/**
 * Convert angle from radians to degrees
 * @param {number} radians angle in radians
 * @returns {number} angle in degrees
 */
function radToDeg (radians) {
  return 180 * radians / PI
}

/**
 * Convert angle from degrees to radians
 * @param {number} degrees angle in degrees
 * @returns {number} andle in radians
 */
function degToRad (degrees) {
  return PI * degrees / 180
}

/**
 * Convert mass to weight on earth
 * @param {number} mass mass of body (kg)
 * @returns {number} weight (N)
 */
function massToWeight (mass) {
  return mass * GRAVITY
}

/**
 * Convert weight on earth to mass
 * @param {number} weight (N)
 * @returns {number} mass (kg)
 */
function weightToMass (weight) {
  return weight / GRAVITY
}

/**
 * @see http://www.engineeringtoolbox.com/rolling-friction-resistance-d_1303.html
 * @param {number} tirePresure presure of tires (bar)
 * @param {number} velocity speed of car (km/h)
 * @returns {number} rolling coeficient
 */
function rollingCoeficient (tirePresure, velocity) {
  return (0.005 + (1 / tirePresure) * (0.01 + 0.0095 * sqr(velocity / 100))) * (velocity / (velocity + 0.1))
}

/**
 * @see http://www.engineeringtoolbox.com/rolling-friction-resistance-d_1303.html
 * @param {number} mass mass of car (kg)
 * @param {number} tirePresure (bar)
 * @param {number} velocity (km/h)
 * @returns {number} rolling resistance (N)
 */
function rollingForce (mass, tirePresure, velocity) {
  return rollingCoeficient(tirePresure, velocity) * massToWeight(mass)
}

/**
 * Convert velocity from km/h to m/s
 * @param velocity Velocity (km/h)
 * @returns {number} velocity (m/s)
 */
function kmhToMs (velocity) {
  return velocity / 3.6
}

/**
 * Convert velocity from m/s to km/h
 * @param velocity Velocity (m/s)
 * @returns {number} velocity (km/h)
 */
function msToKmh (velocity) {
  return velocity * 3.6
}

/**
 * Calculate the drag force asserted on moving car from air resistance
 * @see http://www.engineeringtoolbox.com/drag-coefficient-d_627.html
 * @param {number} dragCoefficient drag coefficient from experimental measurements
 * @param {number} velocity velocity of the car (km/h)
 * @param {number} frontalArea frontal area of the car (m2)
 * @returns {number} drag force (N)
 */
function dragForce (dragCoefficient, velocity, frontalArea) {
  return dragCoefficient * 0.5 * AIR_DENSITY * sqr(kmhToMs(velocity)) * frontalArea
}

function gradientForce () {
  // todo: http://www.engineeringtoolbox.com/inclined-planes-forces-d_1305.html
}

/**
 * Required engine power to keep a car at constant speed
 * @see http://www.engineeringtoolbox.com/cars-power-torque-d_1784.html
 * @param {number} resistingForces total forces acting on the car - rollingForce, dragForce, gradientForce (N)
 * @param {number} velocity velocity to maintain (km/h)
 * @param {number} transmissionEfficiency overall efficiency in the transmission, normally ranging 0.85 (low gear) - 0.9 (direct drive)
 * @returns {number}
 */
function enginePower (resistingForces, velocity, transmissionEfficiency) {
  return resistingForces * kmhToMs(velocity) / transmissionEfficiency
}

/**
 * Convert engine speed from rpm to rps
 * @param {number} rpm engine speed (rpm)
 * @returns {number} engine speed (rps)
 */
function rpmToRps (rpm) {
  return rpm / SECONDS_IN_MINUTE
}

/**
 * Convert engine speed from rps to rpm
 * @param {number} rpm engine speed (rps)
 * @returns {number} engine speed (rpm)
 */
function rpsToRpm (rps) {
  return rps * SECONDS_IN_MINUTE
}

/**
 * Engine torque based on power and speed
 * @see http://www.engineeringtoolbox.com/cars-power-torque-d_1784.html
 * @param {number} enginePower engine power (W)
 * @param {number} engineSpeed engine speed (rpm)
 * @returns {number} torque or momentum (Nm)
 */
function engineTorque (enginePower, engineSpeed) {
  return enginePower / (2 * PI * rpmToRps(engineSpeed))
}

/**
 * Convert inches to cm
 * @param {number} inches length (inch)
 * @returns {number} length (cm)
 */
function inchToCm (inches) {
  return inches * 2.54
}

/**
 * Convert cm to meters
 * @param {number} cm length (cm)
 * @returns {number} length (m)
 */
function cmToM (cm) {
  return cm / 100
}

/**
 * Convert mm to meters
 * @param {number} mm length (mm)
 * @returns {number} length (m)
 */
function mmToM (mm) {
  return mm / 1000
}

/**
 * Calculates a tyre diameter based on common tyre size notation
 * @see http://www.carbibles.com/tyre_bible.html#sizes
 * @param {number} sectionWidth This is the width in mm of the tyre from sidewall to sidewall when it's unstressed and you're looking at it head on (or top-down) (mm)
 * @param {number} aspectRatio This is the ratio of the height of the tyre sidewall, (section height), expressed as a percentage of the width (%)
 * @param {number} rimDiameter This is the diameter in inches of the rim of the wheel that the tyre has been designed to fit on (inch)
 * @returns {number} tyre diameter (m)
 */
function tyreDiameter (sectionWidth, aspectRatio, rimDiameter) {
  return 2 * mmToM(sectionWidth) * (aspectRatio / 100) + cmToM(inchToCm(rimDiameter))
}

/**
 * Force acting between driving wheels and road surface (N)
 * @param {number} engineTorque torque or momentum (Nm)
 * @param {number} transmissionEfficiency overall efficiency in the transmission, normally ranging 0.85 (low gear) - 0.9 (direct drive)
 * @param {number} tyreDiameter tyre diameter (m)
 * @param {number} engineSpeed engine speed (rpm)
 * @param {number} tyreSpeed tyre speed (rpm)
 * @returns {number} Force acting between driving wheels and road surface (N)
 */
function wheelForce (engineTorque, transmissionEfficiency, tyreDiameter, engineSpeed, tyreSpeed) {
  return (2 * engineTorque * transmissionEfficiency / tyreDiameter) * (engineSpeed / tyreSpeed)
}

/**
 * Convert power at given speed to torque
 * @param {number} power power in horsepower (HP)
 * @param {number} speed engine speed in (rpm)
 * @returns {number} torque (Nm)
 */
function powerToTorque (power, speed) {
  return power * HP_TO_NM_COEF / speed
}

/**
 * Convert torque at given speed to power
 * @param {number} torque Torque in (Nm)
 * @param {number} speed Engine speed in (rpm)
 * @returns {number} Power in horsepower (HP)
 */
function torqueToPower (torque, speed) {
  return torque * speed / HP_TO_NM_COEF
}

/**
 * Calculate traction force of a tyre with adhesion coefficient and weight
 * @see http://www.engineeringtoolbox.com/tractive-effort-d_1783.html
 * @param {number} weight vertical force between wheel and surface (N)
 * @param {number} adhesionCoefficient adhesion coefficient between the wheel and the surface
 * @returns {number} traction effort or force acting on the wheel from the surface (N)
 */
function tractionForce (weight, adhesionCoefficient) {
  return weight * adhesionCoefficient
}

function rnd (lowBound, highBound) {
  const range = highBound - lowBound
  return random() * range + lowBound
}

function rnda (array) {
  return array[ floor(rnd(0, array.length)) ]
}

function mToKm (meters) {
  return meters / METERS_IN_KM
}

function mileToKm (miles) {
  return miles * KM_PER_MILE
}

function radToRev (radians) {
  return radians / RADIANS_IN_REVOLUTION
}

function secToMin (seconds) {
  return seconds / SECONDS_IN_MINUTE
}

function radsToRpm (radPerSecond) {
  return radPerSecond * SECONDS_IN_MINUTE / RADIANS_IN_REVOLUTION
}

function rpmToRads (rpm) {
  return rpm * RADIANS_IN_REVOLUTION / SECONDS_IN_MINUTE
}

function radsToKmh (radPerSecond, circumference) {
  return msToKmh(radPerSecond * circumference / RADIANS_IN_REVOLUTION)
}

function kmhToRads (kmh, circumference) {
  return kmhToMs(kmh) * RADIANS_IN_REVOLUTION / circumference
}

function kmToM (km) { return km * METERS_IN_KM }

/**
 *
 * Evaluates y-value at given x point for line that passes
 * through the points (x0,y0) and (y1,y1)
 *
 * @param x
 * @param x0
 * @param y0
 * @param x1
 * @param y1
 * @returns {Number}
 */

function linearInterpolation (x, x0, y0, x1, y1) {
  var a = (y1 - y0) / (x1 - x0)
  var b = -a * x0 + y0
  return a * x + b
}

function bound (val, lowBound, highBound) {
  return min(max(val, lowBound), highBound)
}

function logn (val, base) {
  return log(val) / log(base)
}

function hpToW (hp) {
  return hp * WATTS_IN_HP
}

export {
  GRAVITY,
  AIR_DENSITY,
  KM_PER_MILE,
  centripetalAcceleration,
  centripetalForce,
  radiusOfCurve,
  degToRad,
  radToDeg,
  kmhToMs,
  msToKmh,
  massToWeight,
  weightToMass,
  rollingCoeficient,
  rollingForce,
  dragForce,
  enginePower,
  tyreDiameter,
  wheelForce,
  powerToTorque,
  torqueToPower,
  tractionForce,
  rpmToRps,
  rpsToRpm,
  rnd,
  rnda,
  mToKm,
  mileToKm,
  radToRev,
  secToMin,
  radsToRpm,
  rpmToRads,
  radsToKmh,
  kmhToRads,
  linearInterpolation,
  kmToM,
  bound,
  logn,
  hpToW,
  sqr
}
