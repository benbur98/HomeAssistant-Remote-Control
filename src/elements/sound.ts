import { html } from 'lit';

import { arcIcon, lineOutIcon, opticIcon, tvHeadphonesIcon, tvOpticIcon } from "../icons";

export function renderSound(soundOutput: string, setShowSoundOutput: (set: boolean) => void, showText: boolean, setShowText: (set: boolean) => void, selectSoundOutput: (output: string) => void) {
    return html`
        <div class="grid-container-sound">
            <div class="shape-sound">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260"><path d="m 13 43 a 30 30 0 0 0 60 0 a 30 30 0 0 0 -60 0 M 130 12 h 88 a 30 30 0 0 1 30 30 v 188 a 30 30 0 0 1 -30 30 h -176 a 30 30 0 0 1 -30 -30 v -117 a 30 30 0 0 1 30 -30 a 40 40 0 0 0 41 -41 a 30 30 0 0 1 30 -30 z " fill="var(--remote-button-color)" stroke="#000000" stroke-width="0" /></svg>
            </div>

            <button class="bnt-sound-back ripple"  @click=${() => setShowSoundOutput(false)}><ha-icon icon="mdi:undo-variant"/></button>

            ${showText ? html`
                <button class="btn_soundoutput ripple" @click=${() => setShowText(false)}>SOUND</button>
                <button class="${soundOutput === "tv_speaker" ? 'btn_sound_on tv bnt_sound_text_width' : 'btn_sound_off tv bnt_sound_text_width ripple overlay'}"style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => selectSoundOutput("tv_speaker")}>TV Speaker</button>
                <button class="${soundOutput === "tv_external_speaker" ? 'btn_sound_on tv-opt bnt_sound_text_width' : 'btn_sound_off tv-opt bnt_sound_text_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => selectSoundOutput("tv_external_speaker")}>TV + Optic</button>
                <button class="${soundOutput === "tv_speaker_headphone" ? 'btn_sound_on tv-phone bnt_sound_text_width' : 'btn_sound_off tv-phone bnt_sound_text_width ripple overlay'}" style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => this._select_sound_output("tv_speaker_headphone")}>TV + H-Phone</button>
                <button class="${soundOutput === "external_optical" ? 'btn_sound_on opt bnt_sound_text_width' : 'btn_sound_off opt bnt_sound_text_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => selectSoundOutput("external_optical")}>Optical</button>
                <button class="${soundOutput === "external_arc" ? 'btn_sound_on hdmi bnt_sound_text_width' : 'btn_sound_off hdmi bnt_sound_text_width ripple overlay'}"style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => selectSoundOutput("external_arc")}>HDMI</button>
                <button class="${soundOutput === "lineout" ? 'btn_sound_on line bnt_sound_text_width' : 'btn_sound_off line bnt_sound_text_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => selectSoundOutput("lineout")}>Lineout</button>
                <button class="${soundOutput === "headphone" ? 'btn_sound_on phone bnt_sound_text_width' : 'btn_sound_off phone bnt_sound_text_width ripple overlay'}" style="margin-left: calc(var(--remotewidth) / 10);" @click=${() => selectSoundOutput("headphone")}>HeadPhone</button>
                <button class="${soundOutput === "bt_soundbar" ? 'btn_sound_on bluetooth bnt_sound_text_width' : 'btn_sound_off bluetooth bnt_sound_text_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 10);" @click=${() => selectSoundOutput("bt_soundbar")}>Bluetooth</button>
            ` : html`
                <button class="sound_icon_text  ripple" @click=${() => setShowText(true)}><ha-icon style="height: calc(var(--remotewidth) / 6); width: calc(var(--remotewidth) / 6);" icon="mdi:speaker"></button>
                <button class="${soundOutput === "tv_speaker" ? 'btn_sound_on tv bnt_sound_icon_width' : 'btn_sound_off tv bnt_sound_icon_width ripple overlay'}" style="margin-left: calc(var(--remotewidth) / 7.5);" @click=${() => selectSoundOutput("tv_speaker")}><ha-icon class="icon_source" icon="mdi:television-classic"></button>
                <button class="${soundOutput === "tv_external_speaker" ? 'btn_sound_on tv-opt bnt_sound_icon_width' : 'btn_sound_off tv-opt bnt_sound_icon_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 7.5);" @click=${() => selectSoundOutput("tv_external_speaker")}>${tvOpticIcon()}</button>
                <button class="${soundOutput === "tv_speaker_headphone" ? 'btn_sound_on tv-phone bnt_sound_icon_width' : 'btn_sound_off tv-phone bnt_sound_icon_width ripple overlay'}" style="margin-left: calc(var(--remotewidth) / 7.5);" @click=${() => selectSoundOutput("tv_speaker_headphone")}>${tvHeadphonesIcon()}</button>
                <button class="${soundOutput === "external_optical" ? 'btn_sound_on opt bnt_sound_icon_width' : 'btn_sound_off opt bnt_sound_icon_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 7.5);" @click=${() => selectSoundOutput("external_optical")}>${opticIcon()}</button>
                <button class="${soundOutput === "external_arc" ? 'btn_sound_on hdmi bnt_sound_icon_width' : 'btn_sound_off hdmi bnt_sound_icon_width ripple overlay'}"style="margin-left: calc(var(--remotewidth) / 7.5);" @click=${() => selectSoundOutput("external_arc")}>${arcIcon()}</button>
                <button class="${soundOutput === "lineout" ? 'btn_sound_on line bnt_sound_icon_width' : 'btn_sound_off line bnt_sound_icon_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 7.5);" @click=${() => selectSoundOutput("lineout")}>${lineOutIcon()}</button>
                <button class="${soundOutput === "headphone" ? 'btn_sound_on phone bnt_sound_icon_width' : 'btn_sound_off phone bnt_sound_icon_width ripple overlay'}" style="margin-left: calc(var(--remotewidth) / 7.5);" @click=${() => selectSoundOutput("headphone")}><ha-icon class="icon_source" icon="mdi:headphones"></button>
                <button class="${soundOutput === "bt_soundbar" ? 'btn_sound_on bluetooth bnt_sound_icon_width' : 'btn_sound_off bluetooth bnt_sound_icon_width ripple overlay'}" style="margin-right: calc(var(--remotewidth) / 7.5);" @click=${() => selectSoundOutput("bt_soundbar")}><ha-icon class="icon_source" icon="mdi:bluetooth"></button>
            `}
        </div>`;
}
