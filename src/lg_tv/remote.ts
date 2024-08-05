import { HomeAssistant } from 'custom-card-helpers';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import { HomeAssistantFixed, WindowWithCards } from "../types";
import { getMediaPlayerEntitiesByPlatform } from "../utils";
import "./editor";

import styles from '../style.css';

import { renderDirectionPad } from '../elements/directionpad';
import { renderKeypad } from '../elements/keypad';
import { renderMediaControls } from '../elements/mediaControl';
import { renderSound } from '../elements/sound';
import { renderSourceButtons } from '../elements/sourceButtons';
import { renderSources } from '../elements/sources';
import { amazonIcon, disneyIcon } from '../icons';


const line1 = '  LG WebOS Remote Control Card  ';
const line2 = `  Version: 0.1  `;
console.info(
  `%c${line1}\n%c${line2}`,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);


// Allow this card to appear in the card chooser menu
const windowWithCards = window as unknown as WindowWithCards;
windowWithCards.customCards = windowWithCards.customCards || [];
windowWithCards.customCards.push({
    type: "lg-remote-control",
    name: "LG WebOS Remote Control Card",
    preview: true,
    description: "Remote control card for LG WebOS TV devices"
});



@customElement("lg-remote-control")
class LgRemoteControl extends LitElement {
    static styles = css`${unsafeCSS(styles)}`;

    public hass!: HomeAssistant;
    public config!: any;
    private _show_inputs: boolean;
    private _show_sound_output: boolean;
    private _show_text: boolean;
    private _show_keypad: boolean;
    private _show_vol_text: boolean;
    private volume_value: number;
    private soundOutput: string;
    private output_entity: string;
    private valueDisplayTimeout: NodeJS.Timeout;
    private homeisLongPress: boolean = false;
    private homelongPressTimer: any;

    static getConfigElement() {
        // Create and return an editor element
        return document.createElement("lg-remote-control-editor");
    }

    public static getStubConfig(hass: HomeAssistantFixed) {
        let entities = getMediaPlayerEntitiesByPlatform(hass, "webostv");
        if(entities.length == 0){
            entities = Object.keys(hass.entities).filter(e => e.startsWith("media_player."));
        }
        const entity = entities.length > 0 ? entities[0] : "media_player.lg_webos_smart_tv";
        return {
            "type": 'custom:lg-remote-control',
            "entity": entity
        }
    }

    static get iconMapping() {
        return {
            "disney": disneyIcon(),
            "amazon": amazonIcon(),
        };
    }

    static get properties() {
        return {
            hass: {},
            config: {},
            _show_inputs: {},
            _show_sound_output: {},
            _show_text: {},
            _show_keypad: {},
            _show_vol_text: {},
            volume_value: { type: Number, reflect: true },
            output_entity: { type: Number, reflect: true },
        };
    }

    constructor() {
        super();
        this._show_inputs = false;
        this._show_sound_output = false;
        this._show_text = false;
        this._show_keypad = false;
        this._show_vol_text = false;
        this.volume_value = 0;
        this.soundOutput = "";
    }

    render() {
        const stateObj = this.hass.states[this.config.entity];
        const colorButtons = this.config.color_buttons;

        const borderWidth = this.config.dimensions && this.config.dimensions.border_width ? this.config.dimensions.border_width : "1px";
        const scale = this.config.dimensions && this.config.dimensions.scale ? this.config.dimensions.scale : 1;
        const remoteWidth = Math.round(scale * 260) + "px";
        const tv_name_color = this.config.tv_name_color ? this.config.tv_name_color : "var(--primary-text-color)";
        const backgroundColor = this.config.colors && this.config.colors.background ? this.config.colors.background : "var( --ha-card-background, var(--card-background-color, white) )";
        const borderColor = this.config.colors && this.config.colors.border ? this.config.colors.border: "var(--primary-text-color)";
        const buttonColor = this.config.colors && this.config.colors.buttons ? this.config.colors.buttons : "var(--secondary-background-color)";
        const textColor = this.config.colors && this.config.colors.text ? this.config.colors.text : "var(--primary-text-color)";

        const mac = this.config.mac;

        if (this.config.ampli_entity &&
            (this.hass.states[this.config.entity].attributes.sound_output === 'external_arc' ||
                this.hass.states[this.config.entity].attributes.sound_output === 'external_optical')) {

            this.volume_value = Math.round(this.hass.states[this.config.ampli_entity].attributes.volume_level * 100 * 2) / 2;
            this.output_entity = this.config.ampli_entity;
        } else {
            this.volume_value = Math.round(this.hass.states[this.config.entity].attributes.volume_level * 100);
            this.output_entity = this.config.entity;
        }

        return html`
            <div class="card">
                <div class="page" style="--remote-button-color: ${buttonColor}; --remote-text-color: ${textColor}; --remote-color: ${backgroundColor}; --remotewidth: ${remoteWidth};  --main-border-color: ${borderColor}; --main-border-width: ${borderWidth}">
                    ${this.config.name ? html` <div class="title" style="color:${tv_name_color}" >${this.config.name}</div> ` : ""}

                    <div class="grid-container-power"  style="--remotewidth: ${remoteWidth}">
                        <button class="btn-flat flat-high ripple" @click=${() => this._channelList()}><ha-icon icon="mdi:format-list-numbered"/></button>

                        ${stateObj.state === 'off' ? html`
                            <button class="btn ripple" @click=${() => this._media_player_turn_on(mac)}><ha-icon icon="mdi:power" style="color: ${textColor};"/></button>
                        ` : html`
                            <button class="btn ripple" @click=${() => this._media_player_service("POWER", "turn_off")}><ha-icon icon="mdi:power" style="color: red;"/></button>
                        `}

                        <button class="btn-flat flat-high ripple" @click=${() => this._show_keypad = !this._show_keypad}>123</button>
                    </div>

                    ${this._show_inputs ? renderSources(stateObj.attributes.source_list, stateObj.attributes.source, this._show_inputs, this._select_source) : html`
                        ${this._show_sound_output ? renderSound(stateObj.attributes.sound_output, (t => stateObj.attributes.sound_output), this._show_text, (t => this._show_text), this._select_sound_output) : html`

                            ${this._show_keypad ? renderKeypad(this._button) : renderDirectionPad(this._show_sound_output, this._show_inputs, backgroundColor, this._button)}

                        `}

                        <div class="grid-container-volume-channel-control" >
                            <button class="btn ripple" id="plusButton"  style="border-radius: 50% 50% 0px 0px; margin: 0px auto 0px auto; height: 100%;" }><ha-icon icon="mdi:plus"/></button>
                            <button class="btn-flat flat-high ripple" id="homeButton" style="margin-top: 0px; height: 50%;" @mousedown=${(e) => this._homeButtonDown(e)} @touchstart=${(e) => this._homeButtonDown(e)} @mouseup=${(e) => this._homeButtonUp(e)} @touchend=${(e) => this._homeButtonUp(e)}>
                                 <ha-icon icon="mdi:home"></ha-icon>
                            </button>

                            <button class="btn ripple" style="border-radius: 50% 50% 0px 0px; margin: 0px auto 0px auto; height: 100%;" @click=${() => this._button("CHANNELUP")}><ha-icon icon="mdi:chevron-up"/></button>
                            <button class="btn" style="border-radius: 0px; cursor: default; margin: 0px auto 0px auto; height: 100%;"><ha-icon icon="${stateObj.attributes.is_volume_muted === true ? 'mdi:volume-off' : 'mdi:volume-high'}"/></button>
                            <button class="btn ripple" Style="color:${stateObj.attributes.is_volume_muted === true ? 'red' : ''}; height: 100%;" @click=${() => this._button("MUTE")}><span class="${stateObj.attributes.is_volume_muted === true ? 'blink' : ''}"><ha-icon icon="mdi:volume-mute"></span></button>
                            <button class="btn" style="border-radius: 0px; cursor: default; margin: 0px auto 0px auto; height: 100%;"><ha-icon icon="mdi:parking"/></button>
                            <button class="btn ripple" id="minusButton" style="border-radius: 0px 0px 50% 50%;  margin: 0px auto 0px auto; height: 100%;" ><ha-icon icon="mdi:minus"/></button>
                            <button class="btn-flat flat-high ripple" style="margin-bottom: 0px; height: 50%;" @click=${() => this._button("INFO")}><ha-icon icon="mdi:information-variant"/></button>
                            <button class="btn ripple" style="border-radius: 0px 0px 50% 50%;  margin: 0px auto 0px auto; height: 100%;"  @click=${() => this._button("CHANNELDOWN")}><ha-icon icon="mdi:chevron-down"/></button>
                        </div>

                        ${renderMediaControls(this._command)}

                        ${renderSourceButtons(this.sourceButtons(), this._select_source)}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    _channelList() {
        const popupEvent = new Event('ll-custom', { bubbles: true, cancelable: false, composed: true });
        (popupEvent as any).detail = {
            "browser_mod": {
                "service": "browser_mod.popup",
                "data": {
                    "content": {
                        "type": "custom:card-channel-pad",
                        "entity": this.config.entity,
                        "channels": this.config.channels
                    },
                    "title": " ",
                    "size": "wide",
                    "style": "--popup-border-radius: 15px;"
                }
            }
        };
        this.ownerDocument.querySelector("home-assistant").dispatchEvent(popupEvent);
    }

    _button(button: string) {
        this.callServiceFromConfig(button, "webostv.button", {
            entity_id: this.config.entity,
            button: button
        })
    }

    _command(button: string, command: string) {
        this.callServiceFromConfig(button, "webostv.command", {
            entity_id: this.config.entity,
            command: command
        });
    }

    _media_player_turn_on(mac: string) {
        if (this.config.mac) {
            this.hass.callService("wake_on_lan", "send_magic_packet", {
                mac: mac
            });
        } else {
            this._media_player_service("POWER", "turn_on");
        }
    }

    _media_player_service(button: string, service: string) {
        this.callServiceFromConfig(button, `media_player.${service}`, {
            entity_id: this.config.entity,
        });
    }

    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        const plusButton = this.shadowRoot.querySelector("#plusButton");
        const minusButton = this.shadowRoot.querySelector("#minusButton");
        const interval = this.output_entity === this.config.ampli_entity ? 250 : 100;
        let longPressTimer;
        let isLongPress = false;

        const updateValue = (service) => {
            this.callServiceFromConfig(service.toUpperCase(), `media_player.${service}`, {
                entity_id: this.output_entity,
            });
        };

        plusButton.addEventListener("mousedown", () => {
            if (!isNaN(this.volume_value)) {
                isLongPress = false;
                this._show_vol_text = true;
                longPressTimer = setTimeout(() => {
                    isLongPress = true;
                    updateValue("volume_up");
                    longPressTimer = setInterval(() => updateValue("volume_up"), interval);
                }, 500);
            }
        });

        plusButton.addEventListener("touchstart", (e) => {
            e.preventDefault();
            if (!isNaN(this.volume_value)) {
                isLongPress = false;
                this._show_vol_text = true;
                longPressTimer = setTimeout(() => {
                    isLongPress = true;
                    updateValue("volume_up");
                    longPressTimer = setInterval(() => updateValue("volume_up"), interval);
                }, 500);
            }
        });

        plusButton.addEventListener("mouseup", () => {
            clearTimeout(longPressTimer);
            if (!isLongPress) {
                updateValue("volume_up");
            }
            clearInterval(longPressTimer);
            this.valueDisplayTimeout = setTimeout(() => {
                this._show_vol_text = false;
            }, 500);
        });

        plusButton.addEventListener("touchend", () => {
            clearTimeout(longPressTimer);
            if (!isLongPress) {
                updateValue("volume_up");
            }
            clearInterval(longPressTimer);
            this.valueDisplayTimeout = setTimeout(() => {
                this._show_vol_text = false;
            }, 500);
        });

        minusButton.addEventListener("mousedown", () => {
            if (!isNaN(this.volume_value)) {
                isLongPress = false;
                this._show_vol_text = true;
                longPressTimer = setTimeout(() => {
                    isLongPress = true;
                    updateValue("volume_down");
                    longPressTimer = setInterval(() => updateValue("volume_down"), interval);
                }, 400);
            }
        });

        minusButton.addEventListener("touchstart", (e) => {
            e.preventDefault();
            if (!isNaN(this.volume_value)) {
                isLongPress = false;
                this._show_vol_text = true;
                longPressTimer = setTimeout(() => {
                    isLongPress = true;
                    updateValue("volume_down");
                    longPressTimer = setInterval(() => updateValue("volume_down"), interval);
                }, 400);
            }
        });

        minusButton.addEventListener("mouseup", () => {
            clearTimeout(longPressTimer);
            if (!isLongPress) {
                updateValue("volume_down");
            }
            clearInterval(longPressTimer);
            this.valueDisplayTimeout = setTimeout(() => {
                this._show_vol_text = false;
            }, 500);
        });

        minusButton.addEventListener("touchend", () => {
            clearTimeout(longPressTimer);
            if (!isLongPress) {
                updateValue("volume_down");
            }
            clearInterval(longPressTimer);
            this.valueDisplayTimeout = setTimeout(() => {
                this._show_vol_text = false;
            }, 500);
        });
    }

    updated(changedProperties) {
        if (changedProperties.has("hass")) {
            const tvEntity = this.hass.states[this.config.entity];
            const newSoundOutput = tvEntity.attributes.sound_output;

            if (newSoundOutput !== this.soundOutput) {
                this.soundOutput = newSoundOutput;
                this.requestUpdate();
            }
        }
    }

    _homeButtonDown(event: MouseEvent | TouchEvent) {
      this.homeisLongPress = false;
      this.homelongPressTimer = setTimeout(() => {
          this.homeisLongPress = true;
          this._button("MENU")
      }, 1000);
  }

  _homeButtonUp(event: MouseEvent | TouchEvent) {
      clearTimeout(this.homelongPressTimer);
      if (!this.homeisLongPress) {
          this._button("HOME")
      }
  }


    _select_source(source) {
        this.hass.callService("media_player", "select_source", {
            entity_id: this.config.entity,
            source: source
        });
    }

    _select_sound_output(sound_output) {
        this.hass.callService("webostv", "select_sound_output", {
            entity_id: this.config.entity,
            sound_output: sound_output
        });
        this._show_sound_output = false;
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error("Invalid configuration");
        }
        this.config = config;
    }

    getCardSize() {
        return 15;
    }

    callServiceFromConfig(key: string, service: string, serviceData: Record<string, any>) {
        let serviceToUse = service;
        let serviceDataToUse = serviceData;
        if(this.config.keys && key in this.config.keys) {
            const keyConfig = this.config.keys[key];
            serviceToUse = keyConfig["service"];
            serviceDataToUse = keyConfig["data"];
        }
        this.hass.callService(
          serviceToUse.split(".")[0],
          serviceToUse.split(".")[1],
          serviceDataToUse
        );
    }

    sourceButtons() {
        return this.config.sources.map(source => {
            return html`
                <button class="btn_source ripple" @click=${() => this._select_source(source.name)}>
                    ${LgRemoteControl.getIcon(source.icon)}
                </button>
            `;
        });
    }

    static getIcon(iconName: string) {
        return Object.keys(LgRemoteControl.iconMapping).includes(iconName)
            ? LgRemoteControl.iconMapping[iconName]
            : html`<ha-icon style="height: 70%; width: 70%;" icon="${iconName}"/>`;
    }

}
