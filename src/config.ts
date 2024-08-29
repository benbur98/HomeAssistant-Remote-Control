/*
* Color Configuration items for the Card
*/
export interface ColorConfig {
    background: string;
    border: string;
    buttons: string;
    texts: string;
}

const defaultColorConfig: ColorConfig = {
    background: "var( --ha-card-background, var(--card-background-color, white) )",
    border: "var(--primary-text-color)",
    buttons: "var(--secondary-background-color)",
    texts: "var(--primary-text-color)"
};

/* Get a Complete Color Config, using Default Values where Required */
export function buildColorConfig(overrides: Partial<ColorConfig> = {}): ColorConfig {
    return { ...defaultColorConfig, ...overrides };
}



/*
* Dimension Configuration items for the Card
*/
export interface DimensionConfig {
    scale: number;
    border_width: string;
}

const defaultDimensionConfig: DimensionConfig = {
    scale: 1.0,
    border_width: "1px"
};

/* Get a Complete Dimension Config, using Default Values where Required */
export function buildDimensionConfig(overrides: Partial<DimensionConfig> = {}): DimensionConfig {
    return { ...defaultDimensionConfig, ...overrides };
}

export function calculateRemoteWidth(scale: number): string {
    return Math.round(scale * 260) + "px";
}
