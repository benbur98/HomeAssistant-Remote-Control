import { HomeAssistant } from 'custom-card-helpers';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import { buildColorConfig, buildDimensionConfig, calculateRemoteWidth } from '../config';
import { directionPad } from '../icons';
import styles from '../style.css';
import { addCustomCard, consoleCardDetails } from '../utils';
import { Button } from './buttons';
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

                ${this.config.button_entities[Button.MENU] ? html`<button class="btn ripple item_1a" @click=${() => this._button(Button.MENU)}><ha-icon icon="mdi:menu"/></button>` : html`<div class="item_1a"></div>`}
                <button class="btn ripple item_1b" style="background-color: transparent;" @click=${() => this._button(Button.UP)}><ha-icon icon="mdi:chevron-up"/></button>
                ${this.config.button_entities[Button.SOURCE] ? html`<button class="btn ripple item_1c" @click=${() => this._button(Button.SOURCE)}><ha-icon icon="mdi:import"/></button>` : html`<div class="item_1c"></div>`}

                <button class="btn ripple item_2a" style="background-color: transparent;" @click=${() => this._button(Button.LEFT)}><ha-icon icon="mdi:chevron-left"/></button>
                <div class="ok_button ripple item_2b" style="border: solid 2px ${this.config.colors.background}"  @click=${() => this._button(Button.SELECT)}>'OK'</div>
                <button class="btn ripple item_2c" style="background-color: transparent;" @click=${() => this._button(Button.RIGHT)}><ha-icon icon="mdi:chevron-right"/></button>

                ${this.config.button_entities[Button.BACK] ? html`<button class="btn ripple item_3a" @click=${() => this._button(Button.BACK)}><ha-icon icon="mdi:undo-variant"/></button>` : html`<div class="item_3a"></div>`}
                <button class="btn ripple item_3b" style="background-color: transparent;" @click=${() => this._button(Button.DOWN)}><ha-icon icon="mdi:chevron-down"/></button>
                ${this.config.button_entities[Button.VOLUME_MUTE] ? html`<button class="btn ripple item_3c" @click=${() => this._button(Button.VOLUME_MUTE)}><ha-icon icon="mdi:volume-mute"/></button>` : html`<div class="item_3c"></div>`}
            </div>
        `;
    }

    renderVolumeControl() {
        return html`
            <div class="grid-container-volume-control" >
                <button class="btn ripple" id="minusButton" style="border-radius: 50% 0px 0px 50%; height: 100%;" @click=${() => this._button(Button.VOLUME_DOWN)}><ha-icon icon="mdi:minus"/></button>
                <button class="btn" style="border-radius: 0px; cursor: default; height: 100%;"><ha-icon icon="mdi:volume-high"/></button>
                <button class="btn ripple" id="plusButton" style="border-radius: 0px 50% 50% 0px; height: 100%;" @click=${() => this._button(Button.VOLUME_UP)}><ha-icon icon="mdi:plus"/></button>
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

    _button(button: Button) {
        this.hass.callService("button", "press", {
            entity_id: this.config.button_entities[button],
        });
    }

    setConfig(config: Partial<ProjectorConfig>) {
        if (!config.button_entities)
            throw new Error("Please define all Button Entities");

        const colorConfig = buildColorConfig(config.colors);
        const dimensionConfig = buildDimensionConfig(config.dimensions);

        this.config = {
            ...config,
            colors: colorConfig,
            dimensions: dimensionConfig,
            remoteWidth: calculateRemoteWidth(dimensionConfig.scale)
        } as ProjectorConfig;
    }

    getCardSize() {
        return 15;
    }

}
