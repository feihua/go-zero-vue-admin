import request from '@/utils/request'

const sysUserApi = {
  list: '/sys/user/list'

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
