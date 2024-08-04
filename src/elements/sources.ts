import { html } from 'lit';

export function renderSources(sourceList, source: string, showInputs: boolean, selectSource: (value: string) => void) {
    return html`
        <div class="grid-container-input">
            <div class="shape-input">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 130"><path d="m 187 43 a 30 30 0 0 0 60 0 a 30 30 0 0 0 -60 0 M 148 12 a 30 30 0 0 1 30 30 a 40 40 0 0 0 40 40 a 30 30 0 0 1 30 30 v 18 h -236 v -88 a 30 30 0 0 1 30 -30" fill="var(--remote-button-color)" stroke="#000000" stroke-width="0" /></svg>
            </div>
            <button class="ripple bnt-input-back" @click=${() => this._show_inputs = false}><ha-icon icon="mdi:undo-variant"/></button>
            <p class="source_text"><b>SOURCE</b></p>
            <div class="grid-item-input">
                ${sourceList.map(_source => html`
                    <button class="${source === _source ? 'btn-input-on' : 'btn-input  ripple overlay'}" @click=${() => {
                        selectSource(source);
                        showInputs = false;
                    }}>${source}</button>
                `)}
            </div>
        </div>
    `;
}
