import { HomeAssistant } from 'custom-card-helpers';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import { WindowWithCards } from "./types";

import "./editor";

import styles from './style.css';

const line1 = '  Projector IR Remote Control Card  ';
const line2 = `  version: 0.1  `;
/* eslint no-console: 0 */
console.info(
  `%c${line1}\n%c${line2}`,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);


// Allow this card to appear in the card chooser menu
const windowWithCards = window as unknown as WindowWithCards;
windowWithCards.customCards = windowWithCards.customCards || [];
windowWithCards.customCards.push({
    type: "projector-remote-control",
    name: "Projector IR Remote Control Card",
    preview: true,
    description: "Remote control card for IR Projector"
});



@customElement("projector-remote-control")
class ProjectorRemoteControl extends LitElement {
    static styles = css`${unsafeCSS(styles)}`;

    public hass!: HomeAssistant;
    public config!: any;

    static get properties() {
        return {
            hass: {},
            config: {},
        };
    }

    render() {
        const stateObj = this.hass.states[this.config.entity];

        const borderWidth = this.config.dimensions && this.config.dimensions.border_width ? this.config.dimensions.border_width : "1px";
        const scale = this.config.dimensions && this.config.dimensions.scale ? this.config.dimensions.scale : 1;
        const remoteWidth = Math.round(scale * 260) + "px";
        const backgroundColor = this.config.colors && this.config.colors.background ? this.config.colors.background : "var( --ha-card-background, var(--card-background-color, white) )";
        const borderColor = this.config.colors && this.config.colors.border ? this.config.colors.border : "var(--primary-text-color)";
        const buttonColor = this.config.colors && this.config.colors.buttons ? this.config.colors.buttons : "var(--secondary-background-color)";
        const textColor = this.config.colors && this.config.colors.texts ? this.config.colors.texts : "var(--primary-text-color)";

        return html`
            <div class="card">
            <div class="page" style="--remote-button-color: ${buttonColor}; --remote-text-color: ${textColor}; --remote-color: ${backgroundColor}; --remotewidth: ${remoteWidth};  --main-border-color: ${borderColor}; --main-border-width: ${borderWidth}">

            ${this.config.name ? html`<div class="title" style="color:var(--primary-text-color)" >${this.config.name}</div> ` : ""}

            <div class="grid-container-power"  style="--remotewidth: ${remoteWidth}">
                <button class="btn ripple" @click=${() => this._button("POWER")}><ha-icon icon="mdi:power" style="color: red;"/></button>
            </div>

            <div class="grid-container-cursor">
                <div class="shape">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 79"><path d="m 30 15 a 10 10 0 0 1 20 0 a 15 15 0 0 0 15 15 a 10 10 0 0 1 0 20 a 15 15 0 0 0 -15 15 a 10 10 0 0 1 -20 0 a 15 15 0 0 0 -15 -15 a 10 10 0 0 1 0 -20 a 15 15 0 0 0 15 -15" fill="var(--remote-button-color)" stroke="#000000" stroke-width="0" /></svg>
                </div>
                <button class="btn ripple item_menu" @click=${() => this._button("MENU")}><ha-icon icon="mdi:menu"/></button>
                <button class="btn ripple item_up" style="background-color: transparent;" @click=${() => this._button("UP")}><ha-icon icon="mdi:chevron-up"/></button>
                <button class="btn ripple item_input" @click=${() => this._button("SOURCE")}><ha-icon icon="mdi:import"/></button>
                <button class="btn ripple item_2_sx" style="background-color: transparent;" @click=${() => this._button("LEFT")}><ha-icon icon="mdi:chevron-left"/></button>
                <div class="ok_button ripple item_2_c" style="border: solid 2px ${backgroundColor}"  @click=${() => this._button("ENTER")}>'OK'</div>
                <button class="btn ripple item_right" style="background-color: transparent;" @click=${() => this._button("RIGHT")}><ha-icon icon="mdi:chevron-right"/></button>
                <button class="btn ripple item_back" @click=${() => this._button("BACK")}><ha-icon icon="mdi:undo-variant"/></button>
                <button class="btn ripple item_down" style="background-color: transparent;" @click=${() => this._button("DOWN")}><ha-icon icon="mdi:chevron-down"/></button>
                <button class="btn ripple item_mute" @click=${() => this._button("MUTE")}><ha-icon icon="mdi:volume-mute"/></button>
            </div>

            <div class="grid-container-volume-control" >
                <button class="btn ripple" id="minusButton" style="border-radius: 50% 0px 0px 50%; height: 100%;" @click=${() => this._button("VOLUME_DOWN")}><ha-icon icon="mdi:minus"/></button>
                <button class="btn" style="border-radius: 0px; cursor: default; height: 100%;"><ha-icon icon="mdi:volume-high"/></button>
                <button class="btn ripple" id="plusButton" style="border-radius: 0px 50% 50% 0px; height: 100%;" @click=${() => this._button("VOLUME_UP")}><ha-icon icon="mdi:plus"/></button>
            </div>

            </div>`;
    }

    _button(button: string) {
        this.callServiceFromConfig(button, "button.press", {
            entity_id: this.config.entity,
            button: button
        })
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

    setConfig(config) {
        this.config = config;
    }

    getCardSize() {
        return 15;
    }

}
