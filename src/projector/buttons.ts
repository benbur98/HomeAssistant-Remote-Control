import { entityId } from "../types";


export enum Button {
    MENU = "menu",
    POWER = "power",
    SOURCE = "source",
    UP = "up",
    DOWN = "down",
    LEFT = "left",
    RIGHT = "right",
    SELECT = "select",
    BACK = "back",
    VOLUME_UP = "volume_up",
    VOLUME_DOWN = "volume_down",
    VOLUME_MUTE = "volume_mute",
}


export interface ButtonEntityConfig {
    [Button.MENU]?: entityId;
    [Button.POWER]: entityId;
    [Button.SOURCE]?: entityId;
    [Button.UP]: entityId;
    [Button.DOWN]: entityId;
    [Button.LEFT]: entityId;
    [Button.RIGHT]: entityId;
    [Button.SELECT]: entityId;
    [Button.BACK]?: entityId;
    [Button.VOLUME_UP]: entityId;
    [Button.VOLUME_DOWN]: entityId;
    [Button.VOLUME_MUTE]?: entityId;
}
