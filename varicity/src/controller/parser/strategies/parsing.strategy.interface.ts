import { JsonInputInterface } from "../../../model/entities/jsonInput.interface";
import { Config } from "../../../model/entitiesImplems/config.model";
import { EntitiesList } from "../../../model/entitiesList";

export interface ParsingStrategy {
    parse(data: JsonInputInterface, config: Config, project: string): EntitiesList;
}