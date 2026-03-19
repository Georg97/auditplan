export interface NormKapitel {
	id: string;
	titel: string;
}

import { iso9001Kapitel } from './iso9001';
import { iso14001Kapitel } from './iso14001';
import { iso45001Kapitel } from './iso45001';
import { iso50001Kapitel } from './iso50001';
import { iso27001Kapitel } from './iso27001';

export const alleNormkapitel: Record<string, NormKapitel[]> = {
	'ISO 9001': iso9001Kapitel,
	'ISO 14001': iso14001Kapitel,
	'ISO 45001': iso45001Kapitel,
	'ISO 50001': iso50001Kapitel,
	'ISO 27001': iso27001Kapitel
};

export { iso9001Kapitel, iso14001Kapitel, iso45001Kapitel, iso50001Kapitel, iso27001Kapitel };
