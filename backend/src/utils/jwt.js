import jwt from 'jsonwebtoken'
import { ENV } from '../config/env.js'

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  })
}

export function verifyToken(token) {
  return jwt.verify(token, ENV.JWT_SECRET)
}
