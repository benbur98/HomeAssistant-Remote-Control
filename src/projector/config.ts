import { ColorConfig, DimensionConfig } from "../config";
import { ButtonEntityConfig } from "./buttons";


export interface ProjectorConfig {
    button_entities: ButtonEntityConfig;
    name?: string;
    keys?: Record<string, any>;
    colors: ColorConfig;
    dimensions: DimensionConfig;
    remoteWidth: string;
}
