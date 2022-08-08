import httpStatus from 'http-status'
import service from './services'
import { APISuccess } from '../../common/helpers/api-response'
import {
  UnauthorizedError,
  InternalServerError,
  APIError,
  ForbiddenError,
} from '../../common/helpers/api-error'
import { MESSAGE_THROW_ERROR } from '../../common/constant/index'
import CommonHelper from '../../common/utils/common'
import config from '../../common/config'
import checkAuth from '../../express/middleware/authority-check'

const register = async (req, res, next) => {
  const { userName, phone, email, password } = req.body
  service
    .register(userName, phone, email, password)
    .then((data) => {
      return new APISuccess(res, {
        data: data,
      })
    })
    .catch((err) => {
      next(err)
    })
}

const login = async (req, res, next) => {
  const { userNamePhone, email, password } = req.body
  service
    .login(userNamePhone, email, password)
    .then((data) => {
      return new APISuccess(res, {
        data: data
      })
    })
    .catch((err) => {
      next(err)
    })
}

const createUser = async (req, res, next) => {
  const { userName, phone, email, password, role, fullName, image1, image2, image3, dateOfBirth, address } = req.body
  service
    .createUser(userName, phone, email, password, role, fullName, image1, image2, image3, dateOfBirth, address)
    .then((data) => {
      return new APISuccess(res, {
        data: data,
      })
    })
    .catch((err) => {
      next(err)
    })
}

const updateUser = async (req, res, next) => {
  const { id } = req.params
  const { userName, phone, email, password, role, fullName, image1, image2, image3, dateOfBirth, status, address } = req.body
  const user = await CommonHelper.getUserFromRequest(req)
  service
    .updateUser(id, userName, phone, email, password, role, fullName, image1, image2, image3, dateOfBirth, address, status, user.id)
    .then((data) => {
      return new APISuccess(res, {
        data: data,
      })
    })
    .catch((err) => {
      next(err)
    })
}

const getDetailUser = async (req, res, next) => {
  const { id } = req.params
  service
    .getDetailUser(id)
    .then((data) => {
      return new APISuccess(res, {
        data: data,
      })
    })
    .catch((err) => {
      next(err)
    })
}

const getListUsers = async (req, res, next) => {
  const { page, size, code, fullName, phone, email, userName } = req.query
  service
    .getListUsers(page, size, code, fullName, phone, email, userName)
    .then((data) => {
      return new APISuccess(res, {
        data: data,
      })
    })
    .catch((err) => {
      next(err)
    })
}

const deleteUser = async (req, res, next) => {
  const { id } = req.params
  service
    .deleteUser(id)
    .then((data) => {
      return new APISuccess(res, {
        data: data,
      })
    })
    .catch((err) => {
      next(err)
    })
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
