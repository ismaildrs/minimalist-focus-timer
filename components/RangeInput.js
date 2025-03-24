class RangeInput extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // this.name = this.getAttribute("name");
    // this.max = this.getAttribute("max") || 100;
    // this.step = this.getAttribute("step") || 1;
    // this.value = this.getAttribute("value");

    this.loadSettingsData();

    this.shadowRoot.innerHTML = `
      <style>
        .settings-slider-wrapper {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-bottom: 1rem;
        }
        
        .settings-slider-info-wrapper {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          width: 100%;
          font-size: 14px;
        }
        
        input {
          margin-left: -2px;
          width: 100%;
          height: 5px;
          background: transparent;
          outline: none;
          cursor: pointer;
          border-radius: 10px;
        }

        input::-moz-range-track,
        input::-moz-range-progress {
          width: 100%;
          height: 100%;
          border-radius: 10px;
          background: #4a5d79;
        }

        input::-moz-range-progress {
          background: var(--color-current-session);
        }

        input::-moz-range-thumb {
          appearance: none;
          margin: 0;
          height: 12px;
          width: 12px;
          background: var(--color-current-session);
          border-radius: 100%;
          border: 0;
        }
        
        </style>
    
      <div class="settings-slider-wrapper">
        <div class="settings-slider-info-wrapper">
          <span name="inputInfoName">${this.name}</span>
          <span name="inputInfoValue"></span>
        </div>
        <input type="range" name="sessionLength" min="0" max="${this.max}" step="${this.step}">
      </div>`;
    // Retrieve Local Storage Data
    this.updateSettingsSlider();
    const input = this.shadowRoot.querySelector("input");
    if (this.value) input.value = this.value;

    input.addEventListener("input", async (event) => {
      // Update settings 
      this.updateSettingsSlider();
      const val = event.currentTarget.value * 60 * 1000 + TIMER_PADDING;
      this.type === "mins"
        ? (SETTINGS.sessionLength[this.key] = val)
        : (SETTINGS[this.key] = event.currentTarget.value);
      sendMessage("update_settings", SETTINGS);
      localStorage.setItem(sessionsToLocalStorage[this.id], event.currentTarget.value);
    });

  }

  // updateRangeInput() {
  //   const type = element.getAttribute("type");
  //   const key = element.getAttribute("key");
  //
  //   const val = (SETTINGS.sessionLength[key] - TIMER_PADDING) / 60 / 1000;
  //   type === "mins"
  //     ? element.setAttribute("value", val)
  //     : element.setAttribute("value", SETTINGS[key]);
  //
  //   element.addEventListener("range-input", (event) => {
  //     const val = event.detail.value * 60 * 1000 + TIMER_PADDING;
  //     type === "mins"
  //       ? (SETTINGS.sessionLength[key] = val)
  //       : (SETTINGS[key] = event.detail.value);
  //     sendMessage("update_settings", SETTINGS);
  //   });
  // }
  

  // Loading all variables in one place
  loadSettingsData(){
    this.id = this.getAttribute("id");
    this.name = this.getAttribute("name");
    this.step = this.getAttribute("step") || 1;
    this.value = this.getAttribute("value") || localStorage.getItem(sessionsToLocalStorage[this.id])
    this.type = this.getAttribute("type") || localStorage.getItem(this.name + "-type") || 100;
    this.max = this.getAttribute("max") || localStorage.getItem(this.name + "-max") || 100;
    this.key = this.getAttribute("key");
  }


  saveSettings(){
    const slider = this.shadowRoot.querySelector("input");
    localStorage.setItem(this.name+"-step", slider.value);
  }

  updateSettingsSlider() {
    // const step = this.getAttribute("step") || 1;
    // const type = this.getAttribute("type") || "mins";
    const inputInfoValue = this.shadowRoot.querySelector(
      'span[name="inputInfoValue"]'
    );

    const slider = this.shadowRoot.querySelector("input");
    slider.step = this.step;
    const sliderValue = Math.max(slider.value, 1);

    if (this.type === "mins") {
      const value = sliderValue * 60 * 1000 + TIMER_PADDING;
      inputInfoValue.innerText = durationToString(value, { isVerbose: true });
    } else {
      const innerText = `${sliderValue} round${sliderValue > 1 ? "s" : ""}`;
      inputInfoValue.innerText = innerText;
    }

    this.dispatchEvent(
      new CustomEvent("range-input", {
        bubbles: true,
        composed: true,
        detail: { value: Math.max(1, slider.value) },
      })
    );
  }

  static get observedAttributes() {
    return ["step", "value"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "value") {
      const slider = this.shadowRoot.querySelector("input");
      slider.value = newValue;
    }
    if (oldValue !== newValue) this.updateSettingsSlider();
  }
}

customElements.define("range-input", RangeInput);

