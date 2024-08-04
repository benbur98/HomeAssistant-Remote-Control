import { html } from 'lit';

export function renderKeypad(buttonPress: (value: string) => void) {
    return html`
        <div class="grid-container-keypad">
            <button class="btn-keypad ripple" @click=${() => buttonPress("1")}>1</button>
            <button class="btn-keypad ripple" @click=${() => buttonPress("2")}>2</button>
            <button class="btn-keypad ripple" @click=${() => buttonPress("3")}>3</button>
            <button class="btn-keypad ripple" @click=${() => buttonPress("4")}>4</button>
            <button class="btn-keypad ripple" @click=${() => buttonPress("5")}>5</button>
            <button class="btn-keypad ripple" @click=${() => buttonPress("6")}>6</button>
            <button class="btn-keypad ripple" @click=${() => buttonPress("7")}>7</button>
            <button class="btn-keypad ripple" @click=${() => buttonPress("8")}>8</button>
            <button class="btn-keypad ripple" @click=${() => buttonPress("9")}>9</button>
            <button class="btn-keypad"></button>
            <button class="btn-keypad ripple" @click=${() => buttonPress("0")}>0</button>
            <button class="btn-keypad"></button>
        </div>
    `;
}
