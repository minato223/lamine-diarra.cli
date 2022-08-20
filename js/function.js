/**
 *
 * @param {string} text Le text à animer
 * @param {HTMLElement} container le conteneur du text
 * @param {HTMLElement} body le terminal
 * @returns {Promise}
 */
export function animateText(text, container,body=null) {
  return new Promise((res, rej) => {
    let strings = Array.from(text);
    let i = 0;
    let timer = setInterval(() => {
      container.innerHTML += strings[i];
      if (strings[i + 1] != undefined && strings[i + 1] != null) {
        i++;
      } else {
        clearInterval(timer);
      }
      // window.scrollTo(0, body?.clientHeight??document.body.offsetHeight);
      window.scrollTo(0, document.body.offsetHeight);
    }, 100 / strings.length);
    res();
  });
}
/**
 *
 * @param {string} text Le text à animer
 * @param {HTMLElement} container le conteneur du text
 * @returns {Promise}
 */
export function addLine(text,container,time,css_class) {
  var t = "";
  for (let i = 0; i < text.length; i++) {
    if (text.charAt(i) == " " && text.charAt(i + 1) == " ") {
      t += "&nbsp;&nbsp;";
      i++;
    } else {
      t += text.charAt(i);
    }
  }
  setTimeout(function() {
    var next = createElement("p",{class:`animate-line ${css_class}`},t);
    container.appendChild(next)
    window.scrollTo(0, document.body.offsetHeight);
  }, time*500);
}

/**
 *
 * @param {string} tag Le tag html
 * @param {Object} attributes Un objet conténant l'ensemble clé/valeur des attributs du tag
 * @param {string} tag Le contenu
 * @returns {HTMLElement}
 */
export function createElement(tag, attributes = null,content=null) {
  let object = Object.assign({}, attributes);
  let element = document.createElement(tag);
  Object.keys(object).forEach((key) => {
    element.setAttribute(key, object[key]);
  });
  if (content) {
    element.innerHTML = content
  }
  return element;
}
/**
 * 
 * @param {string} link Ouvrir le lien dans un nouvel onglet
 */
export function openLink(link) {
  setTimeout(function () {
    window.open(link, "_blank");
  }, 500);
}
