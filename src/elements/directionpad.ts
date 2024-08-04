import { html } from 'lit';

export function renderDirectionPad(showSoundOutput: boolean, showInputs: boolean, backgroundColor: string, buttonPress: (value: string) => void) {
    return html`
        <div class="grid-container-cursor">
            <div class="shape">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 79"><path d="m 30 15 a 10 10 0 0 1 20 0 a 15 15 0 0 0 15 15 a 10 10 0 0 1 0 20 a 15 15 0 0 0 -15 15 a 10 10 0 0 1 -20 0 a 15 15 0 0 0 -15 -15 a 10 10 0 0 1 0 -20 a 15 15 0 0 0 15 -15" fill="var(--remote-button-color)" stroke="#000000" stroke-width="0" /></svg>
            </div>
            <button class="btn ripple item_sound" @click=${() => showSoundOutput = true}><ha-icon icon="mdi:speaker"/></button>
            <button class="btn ripple item_up" style="background-color: transparent;" @click=${() => buttonPress("UP")}><ha-icon icon="mdi:chevron-up"/></button>
            <button class="btn ripple item_input" @click=${() => showInputs = true}><ha-icon icon="mdi:import"/></button>
            <button class="btn ripple item_2_sx" style="background-color: transparent;" @click=${() => buttonPress("LEFT")}><ha-icon icon="mdi:chevron-left"/></button>
            <div class="ok_button ripple item_2_c" style="border: solid 2px ${backgroundColor}"  @click=${() => buttonPress("ENTER")}>${this._show_vol_text === true ? this.volume_value : 'OK'}</div>
            <button class="btn ripple item_right" style="background-color: transparent;" @click=${() => buttonPress("RIGHT")}><ha-icon icon="mdi:chevron-right"/></button>
            <button class="btn ripple item_back" @click=${() => buttonPress("BACK")}><ha-icon icon="mdi:undo-variant"/></button>
            <button class="btn ripple item_down" style="background-color: transparent;" @click=${() => buttonPress("DOWN")}><ha-icon icon="mdi:chevron-down"/></button>
            <button class="btn ripple item_exit" @click=${() => buttonPress("EXIT")}>EXIT</button>
        </div>
    `;
}
