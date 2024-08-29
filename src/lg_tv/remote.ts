import { HomeAssistant } from 'custom-card-helpers';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import { HomeAssistantFixed } from "../types";
import { addCustomCard, consoleCardDetails, getMediaPlayerEntitiesByPlatform } from "../utils";
import "./editor";

import styles from '../style.css';

import { buildColorConfig, buildDimensionConfig, calculateRemoteWidth } from '../config';
import { amazonIcon, arcIcon, directionPad, disneyIcon, lineOutIcon, opticIcon, tvHeadphonesIcon, tvOpticIcon } from "../icons";
import { LgTvConfig } from './config';

const CARD_ELEMENT = "lg-remote-control";
const CARD_NAME = "LG WebOS Remote Control";

consoleCardDetails(CARD_NAME, 1.0);

addCustomCard(CARD_ELEMENT, CARD_NAME, "Remote control card for LG WebOS TVs");


@customElement(CARD_ELEMENT)
class LgRemoteControl extends LitElement {
    static styles = css`${unsafeCSS(styles)}`;

    public hass!: HomeAssistant;
    public config!: LgTvConfig;
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
        return document.createElement("lg-remote-control-editor");
    }

    public static getStubConfig(hass: HomeAssistantFixed) {
        let entities = getMediaPlayerEntitiesByPlatform(hass, "webostv");
        if (entities.length == 0) {
            entities = Object.keys(hass.entities).filter(e => e.startsWith("media_player."));
        }
        const entity = entities.length > 0 ? entities[0] : "media_player.lg_webos_smart_tv";
        return {
            "type": 'custom:lg-remote-control',
            "entity": entity
        }
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

    renderTitle() {
        return this.config.name ? html`<div class="title" style="color:${this.config.title_color}">${this.config.name}</div>` : "";
    }

    renderPowerButton(stateObj) {
        return html`
            <div class="grid-container-power"  style="--remotewidth: ${this.config.remoteWidth}">
                <button class="btn-flat flat-high ripple" @click=${() => this._channelList()}><ha-icon icon="mdi:format-list-numbered"/></button>

                ${stateObj.state === 'off' ? html`
                    <button class="btn ripple" @click=${() => this._media_player_turn_on(this.config.mac)}><ha-icon icon="mdi:power" style="color: ${this.config.colors.texts};"/></button>
                ` : html`
                    <button class="btn ripple" @click=${() => this._media_player_service("POWER", "turn_off")}><ha-icon icon="mdi:power" style="color: red;"/></button>
                `}

                <button class="btn-flat flat-high ripple" @click=${() => this._show_keypad = !this._show_keypad}>123</button>
            </div>
        `;
    }

    renderSources(stateObj) {
        return html`
            <div class="grid-container-input">
                <div class="shape-input">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 130"><path d="m 187 43 a 30 30 0 0 0 60 0 a 30 30 0 0 0 -60 0 M 148 12 a 30 30 0 0 1 30 30 a 40 40 0 0 0 40 40 a 30 30 0 0 1 30 30 v 18 h -236 v -88 a 30 30 0 0 1 30 -30" fill="var(--remote-button-color)" stroke="#000000" stroke-width="0" /></svg>
                </div>

                <button class="ripple bnt-input-back" @click=${() => this._show_inputs = false}><ha-icon icon="mdi:undo-variant"/></button>

                <p class="source_text"><b>SOURCE</b></p>

                <div class="grid-item-input">
                    ${stateObj.attributes.source_list.map(source => html`
                        <button class="${stateObj.attributes.source === source ? 'btn-input-on' : 'btn-input  ripple overlay'}" @click=${() => {
                this._select_source(source);
                this._show_inputs = false;
            }}>
                            ${source}
                        </button>
                    `)}
                </div>
        `;
    }

    renderSound(stateObj) {
        return html`
            <div class="grid-container-sound">
                <div class="shape-sound">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260"><path d="m 13 43 a 30 30 0 0 0 60 0 a 30 30 0 0 0 -60 0 M 130 12 h 88 a 30 30 0 0 1 30 30 v 188 a 30 30 0 0 1 -30 30 h -176 a 30 30 0 0 1 -30 -30 v -117 a 30 30 0 0 1 30 -30 a 40 40 0 0 0 41 -41 a 30 30 0 0 1 30 -30 z " fill="var(--remote-button-color)" stroke="#000000" stroke-width="0" /></svg>
                </div>

                <button class="bnt-sound-back ripple"  @click=${() => this._show_sound_output = false}><ha-icon icon="mdi:undo-variant"/></button>

                ${this._show_text ? html`
                    <button class="btn_soundoutput ripple" @click=${() => this._show_text = false}>SOUND</button>
                    <button class="${stateObj.attributes.sound_output === "tv_speaker" ? 'btn_sound_on tv bnt_sound_text_width' : 'btn_sound_off tv bnt_sound_text_width ripple overlay'}"style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => this._select_sound_output("tv_speaker")}>TV Speaker</button>
                    <button class="${stateObj.attributes.sound_output === "tv_external_speaker" ? 'btn_sound_on tv-opt bnt_sound_text_width' : 'btn_sound_off tv-opt bnt_sound_text_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => this._select_sound_output("tv_external_speaker")}>TV + Optic</button>
                    <button class="${stateObj.attributes.sound_output === "tv_speaker_headphone" ? 'btn_sound_on tv-phone bnt_sound_text_width' : 'btn_sound_off tv-phone bnt_sound_text_width ripple overlay'}" style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => this._select_sound_output("tv_speaker_headphone")}>TV + H-Phone</button>
                    <button class="${stateObj.attributes.sound_output === "external_optical" ? 'btn_sound_on opt bnt_sound_text_width' : 'btn_sound_off opt bnt_sound_text_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => this._select_sound_output("external_optical")}>Optical</button>
                    <button class="${stateObj.attributes.sound_output === "external_arc" ? 'btn_sound_on hdmi bnt_sound_text_width' : 'btn_sound_off hdmi bnt_sound_text_width ripple overlay'}"style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => this._select_sound_output("external_arc")}>HDMI</button>
                    <button class="${stateObj.attributes.sound_output === "lineout" ? 'btn_sound_on line bnt_sound_text_width' : 'btn_sound_off line bnt_sound_text_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => this._select_sound_output("lineout")}>Lineout</button>
                    <button class="${stateObj.attributes.sound_output === "headphone" ? 'btn_sound_on phone bnt_sound_text_width' : 'btn_sound_off phone bnt_sound_text_width ripple overlay'}" style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => this._select_sound_output("headphone")}>HeadPhone</button>
                    <button class="${stateObj.attributes.sound_output === "bt_soundbar" ? 'btn_sound_on bluetooth bnt_sound_text_width' : 'btn_sound_off bluetooth bnt_sound_text_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => this._select_sound_output("bt_soundbar")}>Bluetooth</button>
                ` : html`
                    <button class="sound_icon_text  ripple" @click=${() => this._show_text = true}><ha-icon style="height: calc(var(--remotewidth) / 6); width: calc(var(--remotewidth) / 6);" icon="mdi:speaker"></button>
                    <button class="${stateObj.attributes.sound_output === "tv_speaker" ? 'btn_sound_on tv bnt_sound_icon_width' : 'btn_sound_off tv bnt_sound_icon_width ripple overlay'}" style="margin-left: calc(var(--remotewidth) / 7.5);" @click=${() => this._select_sound_output("tv_speaker")}><ha-icon class="icon_source" icon="mdi:television-classic"></button>
                    <button class="${stateObj.attributes.sound_output === "tv_external_speaker" ? 'btn_sound_on tv-opt bnt_sound_icon_width' : 'btn_sound_off tv-opt bnt_sound_icon_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 7.5);" @click=${() => this._select_sound_output("tv_external_speaker")}>${tvOpticIcon()}</button>
                    <button class="${stateObj.attributes.sound_output === "tv_speaker_headphone" ? 'btn_sound_on tv-phone bnt_sound_icon_width' : 'btn_sound_off tv-phone bnt_sound_icon_width ripple overlay'}" style="margin-left: calc(var(--remotewidth) / 7.5);" @click=${() => this._select_sound_output("tv_speaker_headphone")}>${tvHeadphonesIcon()}</button>
                    <button class="${stateObj.attributes.sound_output === "external_optical" ? 'btn_sound_on opt bnt_sound_icon_width' : 'btn_sound_off opt bnt_sound_icon_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 7.5);" @click=${() => this._select_sound_output("external_optical")}>${opticIcon()}</button>
                    <button class="${stateObj.attributes.sound_output === "external_arc" ? 'btn_sound_on hdmi bnt_sound_icon_width' : 'btn_sound_off hdmi bnt_sound_icon_width ripple overlay'}"style="margin-left: calc(var(--remotewidth) / 7.5);" @click=${() => this._select_sound_output("external_arc")}>${arcIcon()}</button>
                    <button class="${stateObj.attributes.sound_output === "lineout" ? 'btn_sound_on line bnt_sound_icon_width' : 'btn_sound_off line bnt_sound_icon_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 7.5);" @click=${() => this._select_sound_output("lineout")}>${lineOutIcon()}</button>
                    <button class="${stateObj.attributes.sound_output === "headphone" ? 'btn_sound_on phone bnt_sound_icon_width' : 'btn_sound_off phone bnt_sound_icon_width ripple overlay'}" style="margin-left: calc(var(--remotewidth) / 7.5);" @click=${() => this._select_sound_output("headphone")}><ha-icon class="icon_source" icon="mdi:headphones"></button>
                    <button class="${stateObj.attributes.sound_output === "bt_soundbar" ? 'btn_sound_on bluetooth bnt_sound_icon_width' : 'btn_sound_off bluetooth bnt_sound_icon_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 7.5);" @click=${() => this._select_sound_output("bt_soundbar")}><ha-icon class="icon_source" icon="mdi:bluetooth"></button>
                `}
            </div>
        `;
    }

    renderKeypad() {
        return html`
            <div class="grid-container-keypad">
                <button class="btn-keypad ripple" @click=${() => this._button("1")}>1</button>
                <button class="btn-keypad ripple" @click=${() => this._button("2")}>2</button>
                <button class="btn-keypad ripple" @click=${() => this._button("3")}>3</button>
                <button class="btn-keypad ripple" @click=${() => this._button("4")}>4</button>
                <button class="btn-keypad ripple" @click=${() => this._button("5")}>5</button>
                <button class="btn-keypad ripple" @click=${() => this._button("6")}>6</button>
                <button class="btn-keypad ripple" @click=${() => this._button("7")}>7</button>
                <button class="btn-keypad ripple" @click=${() => this._button("8")}>8</button>
                <button class="btn-keypad ripple" @click=${() => this._button("9")}>9</button>
                <button class="btn-keypad"></button>
                <button class="btn-keypad ripple" @click=${() => this._button("0")}>0</button>
                <button class="btn-keypad"></button>
            </div>
        `;
    }

    renderDirectionPad() {
        return html`
            <div class="grid-container-cursor">
                ${directionPad()}

                <button class="btn ripple item_1a" @click=${() => this._show_sound_output = true}><ha-icon icon="mdi:speaker"/></button>
                <button class="btn ripple item_1b" style="background-color: transparent;" @click=${() => this._button("UP")}><ha-icon icon="mdi:chevron-up"/></button>
                <button class="btn ripple item_1c" @click=${() => this._show_inputs = true}><ha-icon icon="mdi:import"/></button>

                <button class="btn ripple item_2a" style="background-color: transparent;" @click=${() => this._button("LEFT")}><ha-icon icon="mdi:chevron-left"/></button>
                <div class="ok_button ripple item_2b" style="border: solid 2px ${this.config.colors.background}"  @click=${() => this._button("ENTER")}>${this._show_vol_text === true ? this.volume_value : 'OK'}</div>
                <button class="btn ripple item_2c" style="background-color: transparent;" @click=${() => this._button("RIGHT")}><ha-icon icon="mdi:chevron-right"/></button>

                <button class="btn ripple item_3a" @click=${() => this._button("BACK")}><ha-icon icon="mdi:undo-variant"/></button>
                <button class="btn ripple item_3b" style="background-color: transparent;" @click=${() => this._button("DOWN")}><ha-icon icon="mdi:chevron-down"/></button>
                <button class="btn ripple item_3c" @click=${() => this._button("EXIT")}>EXIT</button>
            </div>
        `;
    }

    renderSourceButtons() {
        function renderConfigSources() {
            return html`
                ${this.config.sources.map(source => {
                return html`
                        <button class="btn_source ripple" @click=${() => this._select_source(source.name)}>
                            ${LgRemoteControl.getIcon(source.icon)}
                        </button>
                    `;
            })}
            `;
        }

        function renderFixedSources() {
            return html`
                <button class="btn_source ripple" @click=${() => this._select_source("Netflix")}><ha-icon style="heigth: 70%; width: 70%;" icon="mdi:netflix"/></button>
                <button class="btn_source ripple" @click=${() => this._select_source("Prime Video")}>${amazonIcon()}</button>
                <button class="btn_source ripple" @click=${() => this._select_source("Disney+")}>${disneyIcon()}</button>
                <button class="btn_source ripple" @click=${() => this._select_source("Youtube")}><ha-icon style="heigth: 70%; width: 70%;" icon="mdi:youtube"/></button>
            `;
        }

        return html`
            <div class="grid-container-source">
                ${this.config.sources ? renderConfigSources() : renderFixedSources()}
            </div>
        `;
    }

    renderColorButtons() {
        return this.config.color_buttons ? html`
            <div class="grid-container-color_btn">
                <button class="btn-color ripple" style="background-color: red; height: calc(var(--remotewidth) / 12);" @click=${() => this._button("RED")}></button>
                <button class="btn-color ripple" style="background-color: green; height: calc(var(--remotewidth) / 12);" @click=${() => this._button("GREEN")}></button>
                <button class="btn-color ripple" style="background-color: yellow; height: calc(var(--remotewidth) / 12);" @click=${() => this._button("YELLOW")}></button>
                <button class="btn-color ripple" style="background-color: blue; height: calc(var(--remotewidth) / 12);" @click=${() => this._button("BLUE")}></button>
            </div>
        ` : html``;
    }

    renderVolumeChannelControl(stateObj) {
        return html`
            <div class="grid-container-volume-channel-control">
                <button class="btn ripple" id="plusButton"  style="border-radius: 50% 50% 0px 0px; margin: 0px auto 0px auto; height: 100%;" }><ha-icon icon="mdi:plus"/></button>
                <button class="btn-flat flat-high ripple" id="homeButton" style="margin-top: 0px; height: 50%;" @mousedown=${(e) => this._homeButtonDown(e)} @touchstart=${(e) => this._homeButtonDown(e)} @mouseup=${(e) => this._homeButtonUp(e)} @touchend=${(e) => this._homeButtonUp(e)}>
                    <ha-icon icon="mdi:home"></ha-icon></button>
                <button class="btn ripple" style="border-radius: 50% 50% 0px 0px; margin: 0px auto 0px auto; height: 100%;" @click=${() => this._button("CHANNELUP")}><ha-icon icon="mdi:chevron-up"/></button>
                <button class="btn" style="border-radius: 0px; cursor: default; margin: 0px auto 0px auto; height: 100%;"><ha-icon icon="${stateObj.attributes.is_volume_muted === true ? 'mdi:volume-off' : 'mdi:volume-high'}"/></button>
                <button class="btn ripple" Style="color:${stateObj.attributes.is_volume_muted === true ? 'red' : ''}; height: 100%;" @click=${() => this._button("MUTE")}><span class="${stateObj.attributes.is_volume_muted === true ? 'blink' : ''}"><ha-icon icon="mdi:volume-mute"></span></button>
                <button class="btn" style="border-radius: 0px; cursor: default; margin: 0px auto 0px auto; height: 100%;"><ha-icon icon="mdi:parking"/></button>
                <button class="btn ripple" id="minusButton" style="border-radius: 0px 0px 50% 50%;  margin: 0px auto 0px auto; height: 100%;" ><ha-icon icon="mdi:minus"/></button>
                <button class="btn-flat flat-high ripple" style="margin-bottom: 0px; height: 50%;" @click=${() => this._button("INFO")}><ha-icon icon="mdi:information-variant"/></button>
                <button class="btn ripple" style="border-radius: 0px 0px 50% 50%;  margin: 0px auto 0px auto; height: 100%;"  @click=${() => this._button("CHANNELDOWN")}><ha-icon icon="mdi:chevron-down"/></button>
            </div>
        `;
    }

    renderMediaControl() {
        return html`
            <div class="grid-container-media-control">
                <button class="btn-flat flat-low ripple"  @click=${() => this._command("PLAY", "media.controls/play")}><ha-icon icon="mdi:play"/></button>
                <button class="btn-flat flat-low ripple"  @click=${() => this._command("PAUSE", "media.controls/pause")}><ha-icon icon="mdi:pause"/></button>
                <button class="btn-flat flat-low ripple"  @click=${() => this._command("STOP", "media.controls/stop")}><ha-icon icon="mdi:stop"/></button>
                <button class="btn-flat flat-low ripple"  @click=${() => this._command("REWIND", "media.controls/rewind")}><ha-icon icon="mdi:skip-backward"/></button>
                <button class="btn-flat flat-low ripple" style="color: red;" @click=${() => this._command("RECORD", "media.controls/Record")}><ha-icon icon="mdi:record"/></button>
                <button class="btn-flat flat-low ripple"  @click=${() => this._command("FAST_FOWARD", "media.controls/fastForward")}><ha-icon icon="mdi:skip-forward"/></button>
            </div>
        `;
    }

    render() {
        const stateObj = this.hass.states[this.config.entity];

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
                <div class="page" style="--remote-button-color: ${this.config.colors.buttons}; --remote-text-color: ${this.config.colors.texts}; --remote-color: ${this.config.colors.background}; --remotewidth: ${this.config.remoteWidth};  --main-border-color: ${this.config.colors.border}; --main-border-width: ${this.config.dimensions.border_width}">
                    ${this.renderTitle()}

                    ${this.renderPowerButton(stateObj)}

                    ${this._show_inputs ? this.renderSources(stateObj) : html`
                        ${this._show_sound_output ? this.renderSound(stateObj) : html`
                            ${this._show_keypad ? this.renderKeypad() : this.renderDirectionPad()}
                        `}

                        ${this.renderSourceButtons()}

                        ${this.renderColorButtons()}

                        ${this.renderVolumeChannelControl(stateObj)}

                        ${this.renderMediaControl()}
                    </div>`}
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


    _select_source(source: string) {
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

    callServiceFromConfig(key: string, service: string, serviceData: Record<string, any>) {
        const keyConfig = this.config.keys?.[key];
        const serviceToUse = keyConfig?.service || service;
        const serviceDataToUse = keyConfig?.data || serviceData;
        this.hass.callService(
            serviceToUse.split(".")[0],
            serviceToUse.split(".")[1],
            serviceDataToUse
        );
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error("Invalid configuration");
        }

        const colorConfig = buildColorConfig(config.colors);
        const dimensionConfig = buildDimensionConfig(config.dimensions);

        const titleColor = this.config.title_color ? this.config.title_color : "var(--primary-text-color)";

        this.config = {
            ...config,
            colors: colorConfig,
            dimensions: dimensionConfig,
            remoteWidth: calculateRemoteWidth(dimensionConfig.scale),
            title_color: titleColor
        };
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

    static get iconMapping() {
        return {
            "disney": disneyIcon(),
            "amazon": amazonIcon(),
        };
    }

    getCardSize() {
        return 15;
    }
}
