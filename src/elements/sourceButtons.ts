import { html } from 'lit';
import { amazonIcon, disneyIcon } from "../icons";

export function renderSourceButtons(sourceButtons: string, selectSource: (value: string) => void) {
    return sourceButtons ? html`${sourceButtons}` : html`
            <div class="grid-container-source">
                <button class="btn_source ripple" @click=${() => selectSource("Netflix")}><ha-icon style="heigth: 70%; width: 70%;" icon="mdi:netflix"/></button>
                <button class="btn_source ripple" @click=${() => selectSource("Prime Video")}>${amazonIcon()}</button>
                <button class="btn_source ripple" @click=${() => selectSource("Disney+")}>${disneyIcon()}</button>
                <button class="btn_source ripple" @click=${() => selectSource("Youtube")}><ha-icon style="heigth: 70%; width: 70%;" icon="mdi:youtube"/></button>
            </div>
    `;
}
