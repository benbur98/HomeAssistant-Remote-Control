// Create and register the card editor
import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import { HomeAssistantFixed } from "../types";
import { getMediaPlayerEntitiesByPlatform } from "../utils";

const EDITOR_ELEMENT = "lg-remote-control-editor";

const avreceivers = {
  "sonos": {
    "friendlyName": "Sonos",
  },
}

const AvReceiverdevicemap = new Map(Object.entries(avreceivers));


@customElement(EDITOR_ELEMENT)
class LgRemoteControlEditor extends LitElement {
  private _config: any;
  private hass: HomeAssistantFixed;

  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }

  // setConfig works the same way as for the card itself
  setConfig(config) {
    this._config = config;
  }

  // This function is called when the input element of the editor loses focus or is changed
  configChanged(ev) {
    const _config = Object.assign({}, this._config);
    _config[ev.target.name.toString()] = ev.target.value;
    this._config = _config;

    // A config-changed event will tell lovelace we have made changed to the configuration
    // this make sure the changes are saved correctly later and will update the preview
    const event = new CustomEvent("config-changed", {
      detail: { config: _config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  configChangedBool(ev) {
    const inputName = ev.target.name;
    const newValue = ev.target.value === 'true';

    const _config = Object.assign({}, this._config);
    _config[inputName] = newValue;
    this._config = _config;

    const event = new CustomEvent('config-changed', {
      detail: { config: _config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  colorsConfigChanged(ev) {
    if (ev.target.tagName === "HA-ICON") {
      const inputName = ev.target.getAttribute("data-input-name");
      if (inputName) {
        const inputElement = this.shadowRoot.querySelector(`[name="${inputName}"]`) as any;
        if (inputElement) {
          inputElement.value = "";

          const _config = Object.assign({}, this._config);
          _config["colors"] = { ...(_config["colors"] ?? {}) };
          _config["colors"][inputName] = "";
          this._config = _config;

          const event = new CustomEvent("config-changed", {
            detail: { config: _config },
            bubbles: true,
            composed: true,
          });
          this.dispatchEvent(event);
        }
      }
    } else {
      const _config = Object.assign({}, this._config);
      _config["colors"] = { ...(_config["colors"] ?? {}) };
      _config["colors"][ev.target.name.toString()] = ev.target.value;
      this._config = _config;

      const event = new CustomEvent("config-changed", {
        detail: { config: _config },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }

  _erase_av_receiver() {
    this._config.av_receiver_family = '';
    this.requestUpdate();
  }

  dimensionsConfigChanged(ev) {
    const _config = Object.assign({}, this._config);
    _config["dimensions"] = { ...(_config["dimensions"] ?? {}) };

    if (ev.target.name === 'border_width') {
      _config["dimensions"][ev.target.name] = ev.target.value + 'px';
    } else {
      _config["dimensions"][ev.target.name] = ev.target.value;
    }

    this._config = _config;

    const event = new CustomEvent("config-changed", {
      detail: { config: _config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  getLgTvEntityDropdown(optionValue) {
    let mediaPlayerEntities = getMediaPlayerEntitiesByPlatform(this.hass, 'webostv');
    let heading = 'LG Media Player Entity';
    let blankEntity = html``;
    if (this._config.tventity == '' || !(mediaPlayerEntities).includes(optionValue)) {
      blankEntity = html`<option value="" selected> - - - - </option> `;
    }
    return html`
            ${heading}:<br>
            <select name="entity" id="entity" class="select-item" .value="${optionValue}"
                    @focusout=${this.configChanged}
                    @change=${this.configChanged} >
                ${blankEntity}
                ${mediaPlayerEntities.map((eid) => {
      if (eid != this._config.tventity) {
        return html`<option value="${eid}">${this.hass.states[eid].attributes.friendly_name || eid}</option> `;
      }
      else {
        return html`<option value="${eid}" selected>${this.hass.states[eid].attributes.friendly_name || eid}</option> `;
      }
    })}
            </select>
            <br>
            <br>`
  }

  setRemoteName(remoteNameValue: string) {
    return html`
            Title (optional)<br>
            <input type="text" name="name" id="name" style="width: 37.8ch;padding: .6em; font-size: 1em;" .value="${remoteNameValue}"
                   @input=${this.configChanged}
            <br><br><br>
        `;
  }

  selectMac(macValue: string) {
    macValue = macValue ?? '00:11:22:33:44:55';
    return html`
            MAC Address:<br>
            <input type="text" name="mac" id="mac" style="width: 37.8ch;padding: .6em; font-size: 1em;" .value="${macValue}"
                   @focusout=${this.configChanged}
                   @change=${this.configChanged}>
            <br><br>
        `;
  }

  selectColors(config) {
    if (!config || !config.colors) {
      config = { colors: { buttons: '', text: '', background: '', border: '' } };
    }
    return html`
            <div class="heading">Colors Configuration:</div>
            <div class="color-selector" class="title">
                <label class="color-item" for="buttons" >Buttons Color:</label>
                <input type="color" name="buttons" id="buttons"  .value="${config.colors && config.colors.buttons || ''}"
                       @input=${this.colorsConfigChanged}></input>
                <ha-icon data-input-name="buttons" icon="mdi:trash-can-outline" @click=${this.colorsConfigChanged}></ha-icon>


                <label class="color-item" for="text">Text Color:</label>
                <input type="color" name="text" id="text"  .value="${config.colors && config.colors.text || ''}"
                       @input=${this.colorsConfigChanged}></input>
                       <ha-icon data-input-name="text" icon="mdi:trash-can-outline" @click=${this.colorsConfigChanged}></ha-icon>

                <label class="color-item" for="background">Background Color:</label>
                <input type="color" name="background" id="background"  .value="${config.colors && config.colors.background || ''}"
                       @input=${this.colorsConfigChanged}></input>
                       <ha-icon data-input-name="background" icon="mdi:trash-can-outline" @click=${this.colorsConfigChanged}></ha-icon>

                <label class="color-item" for="border">Border color:</label>
                <input type="color" name="border" id="border"  .value="${config.colors && config.colors.border || ''}"
                        @input=${this.colorsConfigChanged}></input>
                        <ha-icon data-input-name="border" icon="mdi:trash-can-outline" @click=${this.colorsConfigChanged}></ha-icon>
            </div>
        `;
  }

  colorButtonsConfig(optionvalue) {
    const selectedValue = this._config.color_buttons || 'false';

    return html`
          <div>Show Colour Buttons?</div>
          <select name="color_buttons" id="color_buttons" class="select-item"
                  .value="${selectedValue}"
                  @change=${this.configChangedBool}
          >
            <option value="true" ?selected=${selectedValue === 'true'}>True</option>
            <option value="false" ?selected=${selectedValue === 'false'}>False</option>
          </select>
          <br>
        `;
  }

  setDimensions(dimensions) {
    const borderWidth = parseFloat(dimensions.border_width ?? "1");

    return html`
          <div class="heading">Dimensions:</div>
          <br>
          <label for="scale">Card Scale: ${dimensions.scale ?? 1}</label><br>
          <input type="range" min="0.5" max="1.5" step="0.01" .value="${dimensions && dimensions.scale}" id="scale" name="scale" @input=${this.dimensionsConfigChanged} style="width: 40ch;">
          </input>
          <br>
          <br>
          <label for="border_width">Card border width: ${borderWidth}px</label><br>
          <input type="range" min="1" max="5" step="1" .value="${borderWidth}" id="border_width" name="border_width" @input=${this.dimensionsConfigChanged} style="width: 40ch;">
          </input>
          <br>
          </div>
        `;
  }

  getDeviceAVReceiverDropdown(optionvalue) {
    const familykeys = [...AvReceiverdevicemap.keys()];
    const blankEntity = (!this._config.av_receiver_family || this._config.av_receiver_family === '')
      ? html`<option value="" selected> - - - - </option>`
      : '';
    return html`
        <div>AV-Receiver config:</div>
        <div style="display: flex;width: 40ch;align-items: center;">
         <select
            name="av_receiver_family"
            id="av_receiver_family"
            class="select-item"
            style="width:100%;"
            .value=${optionvalue}
            @focusout=${this.configChanged}
            @change=${this.configChanged}>
            ${blankEntity}
            ${familykeys.map((family) => {
      const receiverData = AvReceiverdevicemap.get(family);
      return html`
                <option value="${family}" ?selected=${optionvalue === family}>
                  ${receiverData.friendlyName}
                </option>
              `;
    })}
          </select>
          ${this._config.av_receiver_family && this._config.av_receiver_family != '' ? html`
          <ha-icon
            style="padding-left: 0.8em;"
            icon="mdi:trash-can-outline"
            @click=${this._erase_av_receiver}
            @mouseover=${() => this.focus()}
          ></ha-icon>`
        : ''}
        </div>
        <br />
    `;
  }

  getMediaPlayerEntityDropdown(optionValue) {
    if (this._config.av_receiver_family) {
      const mediaPlayerEntities = getMediaPlayerEntitiesByPlatform(this.hass, optionValue);
      const blankEntity = (this._config.ampli_entity === '' || !mediaPlayerEntities.includes(optionValue))
        ? html`<option value="" selected> - - - - </option>`
        : '';
      return html`
                A-Receiver config (option):<br>
                <select name="ampli_entity" id="ampli_entity" class="select-item" .value="${optionValue}"
                        @focusout=${this.configChanged}
                        @change=${this.configChanged}>
                    ${blankEntity}
                    ${mediaPlayerEntities.map((eid) => html`
                        <option value="${eid}" ?selected=${eid === this._config.ampli_entity}>
                            ${this.hass.states[eid].attributes.friendly_name || eid}
                        </option>
                    `)}
                </select>
                <br><br>
            `;
    } else {
      return html``;
    }
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
      ${this.getLgTvEntityDropdown(this._config.entity)}
      ${this.selectMac(this._config.mac)}
      ${this.setRemoteName(this._config.name)}
      ${this.selectColors(this._config)}
      ${this.colorButtonsConfig(this._config)}
      ${this.getDeviceAVReceiverDropdown(this._config.av_receiver_family)}
      ${this.getMediaPlayerEntityDropdown(this._config.av_receiver_family)}
      ${this.setDimensions(this._config.dimensions ?? {})}
      <br>
      <p>Other functionalities must be configured manually in code editor</p>
   `;
  }

  static get styles() {
    return css`
        .color-selector {
            display: grid;
            grid-template-columns: auto 8ch 3ch;
            width: 40ch;
        }

        .color-item {
            padding: .6em;
            font-size: 1em;
        }

        .heading {
            font-weight: bold;
        }

        .select-item {
            width: 40ch;
            padding: .6em;
            font-size: 1em;
        }
      `;
  }

}
