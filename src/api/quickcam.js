export var guiURL = `https://madeforyouapp.com`
export var apiURL = `https://quick-cam-api.madeforyouapp.com`
export var remoteURL = guiURL

if (process.env.NODE_ENV === 'development') {
  apiURL = `http://` + location.hostname + ':1337'
  remoteURL = `${location.protocol}//${location.host}`
}

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

export const makeAlbum = async ({ slug, description, adminPassword, viewPassword, enableViewPassword }) => {
  let output = await BaBam({
    method: 'POST',
    baseURL: apiURL,
    url: `/albums`,
    data: {
      slug: slug,
      description: description,
      adminPassword: adminPassword,
      viewPassword: viewPassword,
      enableViewPassword: enableViewPassword,
      date: new Date()
    }
  })
  return output
}

export const login = async ({ album, password }) => {
  let output = await BaBam({
    method: 'POST',
    baseURL: apiURL,
    url: `/albums/login`,
    data: {
      album,
      password
    }
  })
  return output
}

export const getAlbumBySlug = async (input) => {
  let output = await BaBam({
    method: 'GET',
    baseURL: apiURL,
    url: `/albums/?slug=${encodeURIComponent(input.slug)}`
  })
  if (output) {
    return output[0]
  } else {
    return false
  }
}

// function dataURItoBlob (dataURI) {
//   // convert base64 to raw binary data held in a string
//   // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
//   var byteString = atob(dataURI.split(',')[1])

//   // separate out the mime component
//   var mimeString = dataURI.split(',')[0].split(':')[1].split('')[0]

//   // write the bytes of the string to an ArrayBuffer
//   var ab = new ArrayBuffer(byteString.length)
//   var ia = new Uint8Array(ab)
//   for (var i = 0; i < byteString.length; i++) {
//     ia[i] = byteString.charCodeAt(i)
//   }

//   // Old Code
//   // write the ArrayBuffer to a blob, and you're done
//   // var bb = new BlobBuilder()
//   // bb.append(ab)
//   // return bb.getBlob(mimeString)

//   // New Code
//   return new Blob([ab], { type: mimeString })
// }

export const uploadPhoto = async ({ name, blob, albumID }) => {
  let formData = new FormData()
  formData.append(`files.photo`, new File([blob], 'image.jpg'), 'image.jpg')
  formData.append(`data`, JSON.stringify({
    desc: 'desc',
    albumID: albumID,
    deviceUUID: '12345',
    deviceDisplayName: name
  }))

  let output = await BaBam({
    method: 'POST',
    baseURL: apiURL,
    url: `/photos`,
    data: formData
  })
  if (output) {
    return output[0]
  } else {
    return false
  }
}

export const getPhotosBySlug = async ({ slug, viewPassword }) => {
  let output = await BaBam({
    method: 'POST',
    baseURL: apiURL,
    data: {
      slug,
      viewPassword
    },
    url: `/albums/getPhotosBySlug`
  })

  if (output) {
    return output
  } else {
    return false
  }
}

export const removePhotosIn = async ({ photoIDs, slug, viewPassword }) => {
  let output = await BaBam({
    method: 'POST',
    baseURL: apiURL,
    data: {
      photoIDs,
      slug,
      viewPassword
    },
    url: `/albums/removePhotosIn`
  })

  if (output) {
    return output
  } else {
    return false
  }
}
