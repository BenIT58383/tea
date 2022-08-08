/* eslint-disable prettier/prettier */
import httpStatus from 'http-status'
import { Op } from 'sequelize'
import CryptoJS from 'crypto-js'
import app from '../../index'
import {
  APIError,
  APIErrorV2,
  UnauthorizedError,
  ForbiddenError,
} from '../../common/helpers/api-error'
import { masterDb as Sequelize } from '../../sequelize/index'
import { MESSAGE_THROW_ERROR, USER_TYPE } from '../../common/constant/index'
import UserModel from '../../sequelize/models/user'
import config from '../../common/config'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import jwtHelper from '../../common/helpers/jwt-helper'

const register = async (userName, phone, email, password) => {
  const res = {}

  if (email) {
    const emailExist = await UserModel.findOne({ where: { email } })
    if (emailExist) {
      throw new APIError(MESSAGE_THROW_ERROR.EMAIL_CONFLICT, httpStatus.CONFLICT)
    }
  } else {
    email = null
  }

  if (userName && phone) {
    const userNameExist = await UserModel.findOne({ where: { userName } })
    if (userNameExist) {
      throw new APIError(MESSAGE_THROW_ERROR.USER_NAME_CONFLICT, httpStatus.CONFLICT)
    }

    const phoneExist = await UserModel.findOne({ where: { phone } })
    if (phoneExist) {
      throw new APIError(MESSAGE_THROW_ERROR.PHONE_CONFLICT, httpStatus.CONFLICT)
    }
  } else {
    userName = null
    phone = null
  }

  // const pass = bcrypt.hashSync(password, 10)

  const data = await UserModel.create({
    userName,
    phone,
    email,
    password,
    type: 1,
  })

  res.user = data
  return res
}

const login = async (userNamePhone, email, password) => {
  let userName
  let userPhone
  let userEmail
  let user = {}

  if (userNamePhone) {
    userName = await UserModel.findOne({ where: { userName: userNamePhone } })
    userPhone = await UserModel.findOne({ where: { phone: userNamePhone } })
  }

  if (email) {
    userEmail = await UserModel.findOne({ where: { email } })
  }

  // if (userName && bcrypt.compareSync(password, userName.password)) {
  //   user = userName
  // } else if (userPhone || bcrypt.compareSync(password, userPhone.password)) {
  //   user = userPhone
  // } else if (userEmail || bcrypt.compareSync(password, userEmail.password)) {
  //   user = userEmail
  // } else {
  //   throw new APIError(
  //     MESSAGE_THROW_ERROR.ERR_USER_NAME_PHONE_EMAIL_OR_PASSWORD,
  //     httpStatus.NOT_FOUND
  //   )
  // }

  if (userName && (password == userName.password)) {
    user = userName
  } else if (userPhone && (password == userPhone.password)) {
    user = userPhone
  } else if (userEmail && (password == userEmail.password)) {
    user = userEmail
  } else {
    throw new APIError(
      MESSAGE_THROW_ERROR.ERR_USER_NAME_PHONE_EMAIL_OR_PASSWORD,
      httpStatus.NOT_FOUND
    )
  }

  const dataForAccessToken = {
    id: user.id,
    code: user.code,
    phone: user.phone,
    userName: user.userName,
    role: user.role,
  }

  const token = jwt.sign(dataForAccessToken, 'ben$author', {
    expiresIn: '120d',
  })

  const dataForUser = {
    id: user.id,
    code: user.code,
    phone: user.phone,
    userName: user.userName,
    avatar: user.avatar,
    name: user.name,
    birthDay: user.birthDay,
    token: token
  }

  return dataForUser
}

const createUser = async (
  userName,
  phone,
  email,
  password,
  role,
  fullName,
  image1,
  image2,
  image3,
  dateOfBirth,
  address
) => {
  const res = {}

  //handle phone
  if (phone) {
    const phoneExist = await UserModel.findOne({ where: { phone } })
    if (phoneExist) {
      throw new APIError(MESSAGE_THROW_ERROR.PHONE_CONFLICT, httpStatus.CONFLICT)
    }
  } else {
    phone = null
  }

  if (userName) {
    const userNameExist = await UserModel.findOne({ where: { userName } })
    if (userNameExist) {
      throw new APIError(MESSAGE_THROW_ERROR.USER_NAME_CONFLICT, httpStatus.CONFLICT)
    }
  } else {
    userName = null
  }

  if (email) {
    const phoneExist = await UserModel.findOne({ where: { email } })
    if (phoneExist) {
      throw new APIError(MESSAGE_THROW_ERROR.EMAIL_CONFLICT, httpStatus.CONFLICT)
    }
  } else {
    email = null
  }

  // const hashPassword = bcrypt.hashSync(password, 10)

  const data = await UserModel.create({
    userName,
    phone,
    email,
    password,
    role,
    image1,
    image2,
    image3,
    fullName,
    dateOfBirth,
    address,
    status: 1
  })

  res.user = data
  return res
}

const getDetailUser = async (id) => {
  let res = {}

  let queryString = `SELECT id, user_name as userName, phone, email, role, image1, image2, image3, full_name as fullName,
  date_of_birth as dateOfBirth, status,
  created_at as createdAt, updated_at as updatedAt
  from user where id = '${id}'`

  const data = await Sequelize.query(queryString, {
    type: Sequelize.QueryTypes.SELECT,
  })

  if (!data) {
    throw new APIError(MESSAGE_THROW_ERROR.USER_NOT_FOUND, httpStatus.NOT_FOUND)
  }

  res.user = data[0]
  return res
}

const getListUsers = async (page, size, code, fullName, phone, email, userName) => {
  // if (user == '') {
  //   throw new APIError(MESSAGE_THROW_ERROR.LOGIN, httpStatus.FORBIDDEN)
  // }

  // if (
  //   user.type != USER_TYPE.ADMIN ||
  //   user.type == undefined ||
  //   user.type == ''
  // ) {
  //   throw new APIError(MESSAGE_THROW_ERROR.AUTH, httpStatus.UNAUTHORIZED)
  // }

  let res = {}
  let offset = (page - 1) * size

  let queryString = `SELECT id, user_name as userName, phone, email, role, image1, image2, image3, full_name as fullName,
  date_of_birth as dateOfBirth, status,
  created_at as createdAt, updated_at as updatedAt
  from user
  where true `

  if (code) {
    queryString += ` and code like '%${code}%' `
  }

  if (fullName) {
    queryString += ` and full_name like '%${fullName}%' `
  }

  if (phone) {
    queryString += ` and phone like '%${phone}%' `
  }

  if (email) {
    queryString += ` and email like '%${email}%' `
  }

  if (userName) {
    queryString += ` and user_name like '%${userName}%' `
  }

  queryString += ` order by created_at desc`

  const data = await Sequelize.query(queryString, {
    type: Sequelize.QueryTypes.SELECT,
  })

  res.total = data.length
  res.users = data.slice(offset, offset + size)
  return res
}

const updateUser = async (
  id, userName, phone, email, password, role, fullName, image1, image2, image3, dateOfBirth, address, status, userId
) => {
  let res = {}
  let pass = ''

  const userExist = await UserModel.findOne({ where: { id } })
  if (!userExist) {
    throw new APIError(MESSAGE_THROW_ERROR.USER_NOT_FOUND, httpStatus.NOT_FOUND)
  }

  // if (password) {
  //   pass = bcrypt.hashSync(password, 10)
  // }

  const data = await UserModel.update(
    {
      userName,
      phone,
      email,
      password,
      role,
      fullName,
      image1,
      image2,
      image3,
      dateOfBirth,
      address,
      status,
      updatedBy: userId,
    },
    { where: { id } }
  )

  res.data = data
  return res
}

const deleteUser = async (id) => {
  const res = {}

  const userExist = await UserModel.findOne({ where: { id } })
  if (!userExist) {
    throw new APIError(MESSAGE_THROW_ERROR.USER_NOT_FOUND, httpStatus.NOT_FOUND)
  }

  const data = await UserModel.destroy({ where: { id } })

  res.user = data
  return res
}

export default {
  register,
  login,
  createUser,
  updateUser,
  getDetailUser,
  getListUsers,
  deleteUser,
}
