import { ColorConfig, DimensionConfig } from "../config";
import { entityId } from "../types";

interface Source {
    name: string;
    icon: string;
}


export interface LgTvConfig {
    entity: entityId;
    name?: string;
    keys?: Record<string, any>;
    ampli_entity?: string;
    mac?: string;
    sources?: Source[];
    channels?: any;
    color_buttons?: boolean;
    title_color: string;
    colors: ColorConfig;
    dimensions: DimensionConfig;
    remoteWidth: string;
}
