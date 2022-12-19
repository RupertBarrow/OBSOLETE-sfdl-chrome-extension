async function isSessionInformationValidService(endpoint, authToken) {
  let response
  try {
    response = await doCallout(endpoint + "/services/data/v51.0/tooling/query/?q=SELECT Id FROM ApexLog LIMIT 1", "GET", authToken)
  } catch (e) {
    return false
  }

  return response.status === 200
}

async function deleteAllLogsService(endpoint, authToken) {
  let response = {}
  try {
    response = await doCallout(endpoint + "/services/async/51.0/job", "DELETE", authToken, {
      operation: "hardDelete",
      object: "ApexLog",
      contentType: "JSON",
    })

    if (response.status !== 200) {
      response.message = response.status === 401 ? response.statusText + ": Invalid session" : response.message
    }
  } catch (e) {
    response.message = e.message
  }

  return response
}

function doCallout(url, method, authToken, body) {
  let payload = {
    method: method,
    headers: {
      Authorization: "Bearer " + authToken,
      "Content-type": "application/json; charset=UTF-8; text/plain",
    },
  }

  if (body) {
    payload.body = body
  }

  return fetch(url, payload)
}

export { deleteAllLogsService, isSessionInformationValidService }
