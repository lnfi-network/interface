export function getRootUrl() {
  const { origin, protocol, hostname, port } = window.location;
  let url = origin;
  if (!origin) {
    const portString = port && `:${port}`;
    url = `${protocol}//${hostname}${portString}`;
  }
  return url;
}
export function getQueryParam(key) {
  if (!key) {
    return false;
  }

  var value = "";
  var paramStr = window.location.search ? window.location.search.substr(1) : "";

  if (paramStr) {
    paramStr.split("&").forEach(function (param) {
      var arr = param.split("=");
      if (arr[0] == key) {
        value = arr[1];
      }
    });
  }

  return value;
}
export function getQueryVariable(variable) {
  var str = window.location.hash.split("?");
  var query = str[1];
  if (query) {
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return pair[1];
      }
    }
  }
  return "";
}
