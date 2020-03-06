// import EventEmitter from 'events'
import axios from 'axios'

// import slugify from 'slugify'

export var guiURL = `https://withloklok.com`
export var apiURL = `https://bank.yoteach.cloud/`
export var remoteURL = guiURL

if (process.env.NODE_ENV === 'development') {
  apiURL = `http://` + location.hostname + ':1337'
  remoteURL = `${location.protocol}//${location.host}`
}

export const Token = {
  NS: 'StrapiJwtProfile-YoTeachBank@' + apiURL,
  JWT: false,
  Profile: false
}

export const isJSON = (json) => {
  let result = true

  try {
    let data = JSON.parse(json)
    if (data) {
      result = true
    }
  } catch (e) {
    result = false
  }

  return result
}

export const initJWT = () => {
  let NameSpace = Token.NS
  let stringFromLS = localStorage.getItem(NameSpace)
  if (stringFromLS === null || !isJSON(stringFromLS)) {
    localStorage.setItem(NameSpace, JSON.stringify({
      JWT: false,
      Profile: false
    }))
    stringFromLS = localStorage.getItem(NameSpace)
  }
  let data = JSON.parse(stringFromLS)
  for (var kn in data) {
    Token[kn] = data[kn]
  }
  // console.log(Token)
}

export const saveToken = () => {
  let NameSpace = Token.NS
  localStorage.setItem(NameSpace, JSON.stringify(Token))
}

export const login = async ({ identifier, password }) => {
  const resp = await axios({
    method: 'POST',
    baseURL: apiURL,
    url: `/auth/local`,
    data: {
      identifier,
      password
    }
  })

  Token.JWT = resp.data.jwt
  Token.Profile = resp.data.user
  saveToken()
  return resp.data
}
export const register = async ({ username, email, password }) => {
  const resp = await axios({
    method: 'POST',
    baseURL: apiURL,
    url: `/auth/local/register`,
    data: {
      username,
      email,
      password
    }
  })

  Token.JWT = resp.data.jwt
  Token.Profile = resp.data.user
  saveToken()
  return resp.data
}

export const logout = () => {
  Token.JWT = false
  Token.Profile = false
  saveToken()
}

export const checkLogin = async () => {
  return !!Token.Profile
}

export const getHeaders = () => {
  let headers = {}
  if (Token.JWT) {
    headers['Authorization'] = `Bearer ${Token.JWT}`
  }
  return headers
}

initJWT()

let BaBam = async (args) => {
  let axios = (await import('axios')).default
  return axios({
    ...args
  })
    .then(e => {
      return e.data
    })
    .catch(e => {
      console.log(args.method, args.url)
      console.log(e)
      return Promise.reject(e)
    })
}

export const uploadFile = async ({ formData }) => {
  let res = await BaBam({
    method: 'POST',
    baseURL: apiURL,
    url: '/upload',
    headers: getHeaders(),
    data: formData
  })
  return res
}

export const deleteFile = async ({ fileID }) => {
  let res = await BaBam({
    method: 'DELETE',
    baseURL: apiURL,
    url: '/upload/files/' + fileID,
    headers: getHeaders()
  })
  return res
}

export const createPDF = async ({ pdf, md5, text, meta = {} }) => {
  let res = await BaBam({
    method: 'POST',
    baseURL: apiURL,
    url: '/papers',
    headers: getHeaders(),
    data: {
      pdf,
      md5,
      text,
      meta
    }
  })
  return res
}

export const checkHasMD5 = async ({ md5 }) => {
  let res = await BaBam({
    method: 'GET',
    baseURL: apiURL,
    url: `/papers/count?md5=${md5}`,
    headers: getHeaders()
  })

  return res > 0
}

export const analyseFiles = async ({ term }) => {
  let res = await BaBam({
    method: 'POST',
    baseURL: apiURL,
    headers: getHeaders(),
    url: `/actions/analyseFiles`,
    data: {
      term: term
    }
  })

  res.forEach((item) => {
    if (item.pdf && item.pdf.provider === 'local') {
      item.pdf.url = apiURL + item.pdf.url
    }
  })

  return res
}
