import request from '@/utils/request'

const sysUserApi = {
  list: '/sys/user/list',
  add: '/sys/user/add',
  update: '/sys/user/update',
  delete: '/sys/user/delete'

}

/**
 * login func
 * parameter: {
 *     username: '',
 *     password: '',
 *     remember_me: true,
 *     captcha: '12345'
 * }
 * @param parameter
 * @returns {*}
 */
export function list (parameter) {
  return request({
    url: sysUserApi.list,
    method: 'post',
    data: parameter
  })
}

export function addUser (parameter) {
  return request({
    url: sysUserApi.add,
    method: 'post',
    data: parameter
  })
}

export function update (parameter) {
  return request({
    url: sysUserApi.update,
    method: 'post',
    data: parameter
  })
}

export function deleteUser (parameter) {
  return request({
    url: sysUserApi.delete,
    method: 'post',
    data: parameter
  })
}
