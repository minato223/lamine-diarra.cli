import { addLine, animateText, createElement, openLink } from "./function.js";
import {
  lamine,
  minato,
  mon_mail,
  password,
  social,
  terminal_colors,
  terminal_greet,
  terminal_help,
  terminal_secret_callback_url,
  terminal_secret_tip,
} from "./informations.js";

export default class Terminal {
  /**
   *
   * @param {HTMLElement} container L'élement sur lequel on va greffer le terminal
   */
  constructor(container) {
    if (!container) {
      throw "Container introuvable";
    }
    if (container.querySelector(".terminal")) {
      return;
    }
    //Déclaration des variables
    this.history_index = null;
    this.choice_index = 0;
    this.choice_mode = false;
    this.choices_container = null;
    this.histories = [];
    this.active_choice = null;
    this.password = null;
    this.is_password = false;
    this.root_name = `[${mon_mail}]$`;
    this.input_callbacks = [
      {
        key: "clear",
        description: "Permet de vider la console",
        callback: () => {
          this.clearConsole();
          this.updateInput();
        },
      },
      {
        key: "lamine",
        description: "Qui suis je ?",
        callback: () => {
          this.addHeader();
          this.showResult(lamine, false);
          this.updateInput();
        },
      },
      {
        key: "minato",
        description: "Afficher la bannière",
        callback: () => {
          this.displayBanner();
        },
      },
      {
        key: "help",
        description: "Permet d'afficher la liste des commandes disponibles",
        callback: () => {
          this.displayTable(this.input_callbacks);
        },
      },
      {
        key: "color",
        description: "Permet de changer la couleur du terminal",
        callback: (text) => {
          this.displayChoices(terminal_colors, (color) => {
            document.body.style.color = color;
          });
        },
      },
      {
        key: "password",
        description: "Entrez le mot de passe secret",
        callback: () => {
          this.displayPasswordInput();
        },
      },
      {
        key: "social",
        description: "Afficher mes différents réseaux",
        callback: () => {
          this.displayTable(social);
        },
      },
      {
        key: "email",
        description: "Afficher mes différents réseaux",
        callback: () => {
          this.updateInput();
          document.location.href = `mailto:${mon_mail}`;
        },
      },
    ];
    // Création des élements HTML
    this.terminal = createElement("div", { class: "terminal" });
    this.input = createElement("textarea", {
      class: "js-input",
      cols: "30",
      rows: "10",
    });
    this.line = createElement("div", {
      "data-root": this.root_name,
      class: "js-line root",
    });
    this.line_result_container = createElement("div", {
      class: "js-line-result",
    });
    //Manipulation du DOM HTML
    this.terminal.appendChild(createElement("div", { class: "action_bar" }));
    this.terminal.appendChild(this.line_result_container);
    this.terminal.appendChild(this.line);
    this.terminal.appendChild(this.input);
    container.appendChild(this.terminal);
    this.init();
  }
  init() {
    console.log(
      "%cAzy wesh tu fous kw bro!, degage y'a rien ici 😠",
      "color: red; font-weight: bold; font-size: 24px;"
    );
    this.displayBanner();
    this.line.addEventListener("click", () => {
      if (!this.choice_mode) {
        this.focusInput();
      } else {
        if (this.choices_container) {
          this.choices_container.focus();
        }
      }
    });
    this.input.addEventListener("keyup", (e) => {
      const { key, target } = e;
      let value = target.value.slice();
      if (key === "Enter") {
        /**
         * On enlève le \n dû au submit de l'input
         */
        let splited_value = value.split("\n")[0];
        let lowercase_splited_value = splited_value.toLowerCase();
        if (this.is_password) {
          this.verifyPassword(splited_value);
        } else {
          if (
            this.input_callbacks
              .map((input) => input.key)
              .includes(lowercase_splited_value)
          ) {
            this.input_callbacks
              .find((input) => input.key === lowercase_splited_value)
              .callback(lowercase_splited_value);
          } else if (
            social
              .map((s) => s.key.toLowerCase())
              .includes(lowercase_splited_value)
          ) {
            let website = social.find(
              (s) => s.key.toLowerCase() === lowercase_splited_value
            );
            this.navigateToWebsite(website.key, website.link_target);
          } else {
            this.commandNotFound(value);
          }
          this.histories.push(splited_value);
          this.history_index = this.histories.length;
        }
      } else {
        if (this.is_password) {
          this.password = value;
          this.line.textContent = Array.from(value)
            .map((v) => "*")
            .join("");
        } else {
          if (key === "ArrowUp") {
            this.gotoHistoryIndex(this.history_index - 1);
          } else if (key === "ArrowDown") {
            this.gotoHistoryIndex(this.history_index + 1);
          } else {
            this.line.textContent = value;
          }
        }
      }
    });
  }
  focusInput() {
    this.input.focus();
  }
  updateInput(text = "") {
    this.input.value = text;
    this.line.innerHTML = text;
    this.input.focus();
  }
  /**
   * On crée une copie de l'input pour pas qu'on le modifie si l'original est change d'état
   */
  addHeader() {
    let line_clone = this.line.cloneNode(true);
    line_clone.classList.add("no-blink");
    this.line_result_container.appendChild(line_clone);
  }
  /**
   *
   * @param {string} text Le text à afficher comme résultat de la commande taper
   * @param {boolean} with_sign Si toute fois on doit ajouter >>> devant le text
   */
  showResult(text, with_sign = true) {
    let line_result = createElement("div", {
      class: `line-result ${with_sign ? "" : "no-sign"}`,
    });
    this.line_result_container.appendChild(line_result);
    animateText(text, line_result, this.terminal);
    this.updateInput();
  }
  drawResult(texts, with_sign = true, css_class, timer = null) {
    let line_result = createElement("div", {
      class: `line-result ${with_sign ? "" : "no-sign"}`,
    });
    this.line_result_container.appendChild(line_result);
    if (texts.length === 1) {
      addLine(texts[0], line_result, timer ?? 0, css_class);
    } else {
      texts.forEach((t, i) => {
        addLine(t, line_result, i * 0.1, css_class);
      });
    }
    this.updateInput();
  }
  commandNotFound() {
    this.addHeader();
    this.showResult("Aucune commande ne correspond ! ☹️");
  }
  displayBanner() {
    this.drawResult(terminal_greet, false, "terminal_greet");
    this.drawResult(minato, false, "root");
    this.drawResult(terminal_help, false, "", 2);
  }
  displayTable(
    elements = [
      {
        key: null,
        description: null,
        link_target: null,
        onClickCallback: (target) => {},
      },
    ]
  ) {
    this.addHeader();
    let table = createElement("table", {
      class: "help_container",
      cellspacing: "5",
    });
    let tbody = createElement("tbody");
    elements.forEach(async (input) => {
      let tr = createElement("tr");
      let key = createElement("td", { class: "important" });
      let description = createElement("td");
      let description_content = createElement("span", {
        class: "help_description",
      });
      description.appendChild(description_content);
      tr.appendChild(key);
      tr.appendChild(description);
      tbody.appendChild(tr);
      if (input.link_target !== null && input.link_target !== undefined) {
        description_content.classList.add("link");
        description_content.addEventListener("click", () => {
          this.navigateToWebsite(input.key, input.link_target);
        });
      }
      await animateText(input.key, key, this.terminal);
      await animateText(input.description, description_content, this.terminal);
    });
    table.appendChild(tbody);
    this.line_result_container.appendChild(table);
    this.updateInput();
  }

  navigateToWebsite(name, url) {
    this.showResult(`Ouverture de ${name} ...`);
    openLink(url);
  }
  clearConsole() {
    this.clearLineResultContainer();
    this.clearChoiceContainer();
  }
  clearLineResultContainer() {
    while (this.line_result_container.lastChild) {
      this.line_result_container.removeChild(
        this.line_result_container.lastChild
      );
    }
  }
  clearChoiceContainer() {
    if (this.choices_container) {
      while (this.choices_container.lastChild) {
        this.choices_container.removeChild(this.choices_container.lastChild);
      }
      this.choices_container.blur();
    }
  }

  displayChoices(choices = [], choiceSelectCallback = (choice) => {}) {
    this.choices_container = createElement("div", {
      class: "js-choices",
      tabindex: "0",
    });
    this.terminal.appendChild(this.choices_container);
    this.choice_mode = true;
    this.line.classList.add("no-blink");
    choices.push("exit");
    choices.forEach(async (choice, index) => {
      let li = createElement("li", {
        class: `choice ${index === this.choice_index ? "active" : ""}`,
        id: "choice-" + index,
        "data-choice": choice,
      });
      this.choices_container.appendChild(li);
      await animateText(choice, li, this.terminal);
    });
    this.input.blur();
    this.choices_container.focus();
    this.choices_container.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "ArrowLeft":
          this.gotoChoiceIndex(this.choice_index - 1);
          break;
        case "ArrowRight":
          this.gotoChoiceIndex(this.choice_index + 1);
          break;
        case "Enter":
          if (this.active_choice) {
            const { choice } = this.active_choice.dataset;
            if (choice !== "exit") {
              choiceSelectCallback(choice);
            }
          }
          this.line_result_container.appendChild(this.line.cloneNode(true));
          this.choice_index = 0;
          this.choice_mode = false;
          this.line.classList.remove("no-blink");
          this.clearChoiceContainer();
          this.updateInput();
          break;
        default:
          break;
      }
    });
  }
  changeRootName(name) {
    this.line.setAttribute("data-root", name);
  }
  displayPasswordInput() {
    this.addHeader();
    this.drawResult(terminal_secret_tip,false)
    this.updateInput();
    this.changeRootName("password");
    this.is_password = true;
  }
  verifyPassword(value) {
    this.addHeader()
    if (value === password) {
      this.navigateToWebsite("Youtube",terminal_secret_callback_url)
    } else {
      this.showResult("Mot de passe incorrect");
    }
    this.updateInput();
    this.changeRootName(this.root_name);
    this.is_password = false;
  }
  gotoChoiceIndex(index) {
    this.active_choice = document.querySelector(".choice.active");
    let current_choice = document.querySelector(`#choice-${index}`);
    if (current_choice != null) {
      this.choice_index = index;
      this.active_choice?.classList.remove("active");
      current_choice.classList.add("active");
      this.active_choice = current_choice;
    } else {
      this.active_choice = null;
    }
  }
  gotoHistoryIndex(index) {
    if (index >= this.histories.length) {
      this.history_index = this.histories.length;
    } else {
      if (this.histories[index] != null && this.histories[index] != undefined) {
        this.history_index = index;
      } else {
        this.history_index = 0;
      }
    }
    if (this.histories[this.history_index] != undefined) {
      this.updateInput(this.histories[this.history_index]);
    } else {
      this.updateInput("");
    }
  }
}