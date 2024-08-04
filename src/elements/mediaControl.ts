import { html } from 'lit';

export function renderMediaControls(command: (button: string, command: string) => void) {
    return html`
        <div class="grid-container-media-control" >
            <button class="btn-flat flat-low ripple"  @click=${() => command("PLAY", "media.controls/play")}><ha-icon icon="mdi:play"/></button>
            <button class="btn-flat flat-low ripple"  @click=${() => command("PAUSE", "media.controls/pause")}><ha-icon icon="mdi:pause"/></button>
            <button class="btn-flat flat-low ripple"  @click=${() => command("STOP", "media.controls/stop")}><ha-icon icon="mdi:stop"/></button>
            <button class="btn-flat flat-low ripple"  @click=${() => command("REWIND", "media.controls/rewind")}><ha-icon icon="mdi:skip-backward"/></button>
            <button class="btn-flat_blank flat-low"> </button>
            <button class="btn-flat flat-low ripple"  @click=${() => command("FAST_FOWARD", "media.controls/fastForward")}><ha-icon icon="mdi:skip-forward"/></button>
        </div>
    `;
}
