import { HomeAssistant } from 'custom-card-helpers';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import { buildColorConfig, buildDimensionConfig, calculateRemoteWidth } from '../config';
import { directionPad } from '../icons';
import styles from '../style.css';
import { addCustomCard, consoleCardDetails } from '../utils';
import { ProjectorConfig } from './config';
import overrideStyles from './style.css';

const CARD_ELEMENT = "projector-remote-control";
const CARD_NAME = "Projector IR Remote Control";

consoleCardDetails(CARD_NAME, 1.0);

addCustomCard(CARD_ELEMENT, CARD_NAME, "Remote control card for IR Projector");


@customElement(CARD_ELEMENT)
class ProjectorRemoteControl extends LitElement {
    static styles = [
        css`${unsafeCSS(styles)}`,
        css`${unsafeCSS(overrideStyles)}`
    ];

    public hass!: HomeAssistant;
    public config!: ProjectorConfig;

    static get properties() {
        return {
            hass: {},
            config: {},
        };
    }

    renderTitle() {
        return this.config.name ? html`<div class="title" style="color:var(--primary-text-color)">${this.config.name}</div>` : "";
    }

    renderPowerButton() {
        return html`
            <div class="grid-container-power"  style="--remotewidth: ${this.config.remoteWidth}">
                <button class="btn ripple" @click=${() => this._button(Button.POWER)}><ha-icon icon="mdi:power" style="color: red;"/></button>
            </div>
        `;
    }

    renderDirectionPad() {
        return html`
            <div class="grid-container-cursor">
                ${directionPad()}

                <button class="btn ripple item_1a" @click=${() => this._button(Button.MENU)}><ha-icon icon="mdi:menu"/></button>
                <button class="btn ripple item_1b" style="background-color: transparent;" @click=${() => this._button("up")}><ha-icon icon="mdi:chevron-up"/></button>
                <button class="btn ripple item_1c" @click=${() => this._button("source")}><ha-icon icon="mdi:import"/></button>

                <button class="btn ripple item_2a" style="background-color: transparent;" @click=${() => this._button("left")}><ha-icon icon="mdi:chevron-left"/></button>
                <div class="ok_button ripple item_2b" style="border: solid 2px ${this.config.colors.background}"  @click=${() => this._button("select")}>'OK'</div>
                <button class="btn ripple item_2c" style="background-color: transparent;" @click=${() => this._button("right")}><ha-icon icon="mdi:chevron-right"/></button>

                <button class="btn ripple item_3a" @click=${() => this._button("back")}><ha-icon icon="mdi:undo-variant"/></button>
                <button class="btn ripple item_3b" style="background-color: transparent;" @click=${() => this._button("down")}><ha-icon icon="mdi:chevron-down"/></button>
                <button class="btn ripple item_3c" @click=${() => this._button("mute")}><ha-icon icon="mdi:volume-mute"/></button>
            </div>
        `;
    }

    renderVolumeControl() {
        return html`
            <div class="grid-container-volume-control" >
                <button class="btn ripple" id="minusButton" style="border-radius: 50% 0px 0px 50%; height: 100%;" @click=${() => this._button("volume_down")}><ha-icon icon="mdi:minus"/></button>
                <button class="btn" style="border-radius: 0px; cursor: default; height: 100%;"><ha-icon icon="mdi:volume-high"/></button>
                <button class="btn ripple" id="plusButton" style="border-radius: 0px 50% 50% 0px; height: 100%;" @click=${() => this._button("volume_up")}><ha-icon icon="mdi:plus"/></button>
            </div>
        `;
    }

    render() {
        return html`
            <div class="card">
                <div class="page" style="--remote-button-color: ${this.config.colors.buttons}; --remote-text-color: ${this.config.colors.texts}; --remote-color: ${this.config.colors.background}; --remotewidth: ${this.config.remoteWidth};  --main-border-color: ${this.config.colors.border}; --main-border-width: ${this.config.dimensions.border_width}">
                    ${this.renderTitle()}

                    ${this.renderPowerButton()}

                    ${this.renderDirectionPad()}

                    ${this.renderVolumeControl()}
                </div>
            </div>
        `;
    }

    _button(button: string) {
        this.callServiceFromConfig(button, "button.press", {
            entity_id: this.config.entity,
            button: button
        })
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

    setConfig(config: any) {
        const colorConfig = buildColorConfig(config.colors);
        const dimensionConfig = buildDimensionConfig(config.dimensions);

        this.config = {
            ...config,
            colors: colorConfig,
            dimensions: dimensionConfig,
            remoteWidth: calculateRemoteWidth(dimensionConfig.scale)
        };
    }

    getCardSize() {
        return 15;
    }

}
