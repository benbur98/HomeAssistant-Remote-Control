import { HomeAssistantFixed, WindowWithCards } from "./types";

export function getMediaPlayerEntitiesByPlatform(hass: HomeAssistantFixed, platformName: string) {
  let entities = Object.keys(hass.entities).filter(
    (eid) => hass.entities[eid].platform === platformName
  );
  const re = /media_player/;
  return entities.filter(a => re.exec(a));
}


/* Log the given Card Title to the console */
export function consoleCardDetails(cardTitle: string, version: Number) {
  const titleString = `  ${cardTitle} Card  `;
  const versionString = `  version: ${version}  `;
  console.info(
    `%c${titleString}\n%c${versionString}`,
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',
  );
}


/* Add the given Card to the Custom Card Select Menu in HomeAssistant */
export function addCustomCard(element: string, name: string, description: string) {
  const windowWithCards = window as unknown as WindowWithCards;
  windowWithCards.customCards = windowWithCards.customCards || [];
  windowWithCards.customCards.push({
    type: element,
    name: name + " Card",
    preview: true,
    description: description
  });
}
