import { Joint, Vec2 } from 'planck-js'
import create from 'planck-js/lib/util/create'
import options from 'planck-js/lib/util/options'

MyJoint.TYPE = 'my-joint'

MyJoint._super = Joint
MyJoint.prototype = create(MyJoint._super.prototype)

const MyJointDef = {}

function MyJoint (def, bodyA, bodyB, anchor) {
  if (!(this instanceof MyJoint)) {
    return new MyJoint(def, bodyA, bodyB, anchor)
  }

  def = options(def, MyJointDef)
  Joint.call(this, def, bodyA, bodyB)
  this.m_type = MyJoint.TYPE

  if (anchor) {
    this.m_localAnchorA = bodyA.getLocalPoint(anchor)
    this.m_localAnchorB = bodyB.getLocalPoint(anchor)
  } else {
    this.m_localAnchorA = Vec2.zero()
    this.m_localAnchorB = Vec2.zero()
  }

  // Solver temp
  this.m_localCenterA // Vec2
  this.m_localCenterB // Vec2
}

/**
 * The local anchor point relative to bodyA's origin.
 */
MyJoint.prototype.getLocalAnchorA = function () {
  return this.m_localAnchorA
}

/**
 * The local anchor point relative to bodyB's origin.
 */
MyJoint.prototype.getLocalAnchorB = function () {
  return this.m_localAnchorB
}

MyJoint.prototype.getAnchorA = function () {
  return this.m_bodyA.getWorldPoint(this.m_localAnchorA)
}

MyJoint.prototype.getAnchorB = function () {
  return this.m_bodyB.getWorldPoint(this.m_localAnchorB)
}

MyJoint.prototype.initVelocityConstraints = function (step) {
  this.m_localCenterA = this.m_bodyA.m_sweep.localCenter
  this.m_localCenterB = this.m_bodyB.m_sweep.localCenter
  this.m_invMassA = this.m_bodyA.m_invMass
  this.m_invMassB = this.m_bodyB.m_invMass
  this.m_invIA = this.m_bodyA.m_invI
  this.m_invIB = this.m_bodyB.m_invI

  var aA = this.m_bodyA.c_position.a
  var vA = this.m_bodyA.c_velocity.v
  var wA = this.m_bodyA.c_velocity.w

  var aB = this.m_bodyB.c_position.a
  var vB = this.m_bodyB.c_velocity.v
  var wB = this.m_bodyB.c_velocity.w

  var qA = Rot.neo(aA), qB = Rot.neo(aB)

  // Compute the effective mass matrix.
  this.m_rA = Rot.mul(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA))
  this.m_rB = Rot.mul(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB))

  // J = [-I -r1_skew I r2_skew]
  // [ 0 -1 0 1]
  // r_skew = [-ry; rx]

  // Matlab
  // K = [ mA+r1y^2*iA+mB+r2y^2*iB, -r1y*iA*r1x-r2y*iB*r2x, -r1y*iA-r2y*iB]
  // [ -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB, r1x*iA+r2x*iB]
  // [ -r1y*iA-r2y*iB, r1x*iA+r2x*iB, iA+iB]

  var mA = this.m_invMassA, mB = this.m_invMassB; // float
  var iA = this.m_invIA, iB = this.m_invIB; // float

  var K = new Mat22()
  K.ex.x = mA + mB + iA * this.m_rA.y * this.m_rA.y + iB * this.m_rB.y
    * this.m_rB.y
  K.ex.y = -iA * this.m_rA.x * this.m_rA.y - iB * this.m_rB.x * this.m_rB.y
  K.ey.x = K.ex.y
  K.ey.y = mA + mB + iA * this.m_rA.x * this.m_rA.x + iB * this.m_rB.x
    * this.m_rB.x

  this.m_linearMass = K.getInverse()

  this.m_angularMass = iA + iB
  if (this.m_angularMass > 0.0) {
    this.m_angularMass = 1.0 / this.m_angularMass
  }

  if (step.warmStarting) {
    // Scale impulses to support a variable time step.
    this.m_linearImpulse.mul(step.dtRatio)
    this.m_angularImpulse *= step.dtRatio

    var P = Vec2.neo(this.m_linearImpulse.x, this.m_linearImpulse.y)

    vA.wSub(mA, P)
    wA -= iA * (Vec2.cross(this.m_rA, P) + this.m_angularImpulse)

    vB.wAdd(mB, P)
    wB += iB * (Vec2.cross(this.m_rB, P) + this.m_angularImpulse)

  } else {
    this.m_linearImpulse.setZero()
    this.m_angularImpulse = 0.0
  }

  this.m_bodyA.c_velocity.v = vA
  this.m_bodyA.c_velocity.w = wA
  this.m_bodyB.c_velocity.v = vB
  this.m_bodyB.c_velocity.w = wB
}

export default MyJoint
