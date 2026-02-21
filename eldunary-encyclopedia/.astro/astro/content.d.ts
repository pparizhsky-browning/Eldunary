declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"arashi": {
"berserk.md": {
	id: "berserk.md";
  slug: "berserk";
  body: string;
  collection: "arashi";
  data: InferEntrySchema<"arashi">
} & { render(): Render[".md"] };
"biruda.md": {
	id: "biruda.md";
  slug: "biruda";
  body: string;
  collection: "arashi";
  data: InferEntrySchema<"arashi">
} & { render(): Render[".md"] };
"dark-paladin.md": {
	id: "dark-paladin.md";
  slug: "dark-paladin";
  body: string;
  collection: "arashi";
  data: InferEntrySchema<"arashi">
} & { render(): Render[".md"] };
"helm.md": {
	id: "helm.md";
  slug: "helm";
  body: string;
  collection: "arashi";
  data: InferEntrySchema<"arashi">
} & { render(): Render[".md"] };
"kaboom.md": {
	id: "kaboom.md";
  slug: "kaboom";
  body: string;
  collection: "arashi";
  data: InferEntrySchema<"arashi">
} & { render(): Render[".md"] };
"lucifer.md": {
	id: "lucifer.md";
  slug: "lucifer";
  body: string;
  collection: "arashi";
  data: InferEntrySchema<"arashi">
} & { render(): Render[".md"] };
"nebbio.md": {
	id: "nebbio.md";
  slug: "nebbio";
  body: string;
  collection: "arashi";
  data: InferEntrySchema<"arashi">
} & { render(): Render[".md"] };
"oto.md": {
	id: "oto.md";
  slug: "oto";
  body: string;
  collection: "arashi";
  data: InferEntrySchema<"arashi">
} & { render(): Render[".md"] };
"rabuka.md": {
	id: "rabuka.md";
  slug: "rabuka";
  body: string;
  collection: "arashi";
  data: InferEntrySchema<"arashi">
} & { render(): Render[".md"] };
"ryobik.md": {
	id: "ryobik.md";
  slug: "ryobik";
  body: string;
  collection: "arashi";
  data: InferEntrySchema<"arashi">
} & { render(): Render[".md"] };
"spector.md": {
	id: "spector.md";
  slug: "spector";
  body: string;
  collection: "arashi";
  data: InferEntrySchema<"arashi">
} & { render(): Render[".md"] };
"unknown-0.md": {
	id: "unknown-0.md";
  slug: "unknown-0";
  body: string;
  collection: "arashi";
  data: InferEntrySchema<"arashi">
} & { render(): Render[".md"] };
"velho.md": {
	id: "velho.md";
  slug: "velho";
  body: string;
  collection: "arashi";
  data: InferEntrySchema<"arashi">
} & { render(): Render[".md"] };
};
"characters": {
"anton.md": {
	id: "anton.md";
  slug: "anton";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"azaraith.md": {
	id: "azaraith.md";
  slug: "azaraith";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"crimson-knight.md": {
	id: "crimson-knight.md";
  slug: "crimson-knight";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"elric.md": {
	id: "elric.md";
  slug: "elric";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"fluffy.md": {
	id: "fluffy.md";
  slug: "fluffy";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"golem-king.md": {
	id: "golem-king.md";
  slug: "golem-king";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"isolde.md": {
	id: "isolde.md";
  slug: "isolde";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"king-aldric.md": {
	id: "king-aldric.md";
  slug: "king-aldric";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"princess-seraphina.md": {
	id: "princess-seraphina.md";
  slug: "princess-seraphina";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"queen-nayele.md": {
	id: "queen-nayele.md";
  slug: "queen-nayele";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"selvarin.md": {
	id: "selvarin.md";
  slug: "selvarin";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"sunlee.md": {
	id: "sunlee.md";
  slug: "sunlee";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"vaelith-the-hollow.md": {
	id: "vaelith-the-hollow.md";
  slug: "vaelith-the-hollow";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"varnokh.md": {
	id: "varnokh.md";
  slug: "varnokh";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"veles.md": {
	id: "veles.md";
  slug: "veles";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"vorryn.md": {
	id: "vorryn.md";
  slug: "vorryn";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"vorvax.md": {
	id: "vorvax.md";
  slug: "vorvax";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"vulkran.md": {
	id: "vulkran.md";
  slug: "vulkran";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
"zunarorth.md": {
	id: "zunarorth.md";
  slug: "zunarorth";
  body: string;
  collection: "characters";
  data: InferEntrySchema<"characters">
} & { render(): Render[".md"] };
};
"cities": {
"adlens.md": {
	id: "adlens.md";
  slug: "adlens";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"akison.md": {
	id: "akison.md";
  slug: "akison";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"andport.md": {
	id: "andport.md";
  slug: "andport";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"anehull.md": {
	id: "anehull.md";
  slug: "anehull";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"clocester.md": {
	id: "clocester.md";
  slug: "clocester";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"cridbury.md": {
	id: "cridbury.md";
  slug: "cridbury";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"fodon.md": {
	id: "fodon.md";
  slug: "fodon";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"frada.md": {
	id: "frada.md";
  slug: "frada";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"glaril.md": {
	id: "glaril.md";
  slug: "glaril";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"grousea.md": {
	id: "grousea.md";
  slug: "grousea";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"hiypolis.md": {
	id: "hiypolis.md";
  slug: "hiypolis";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"ibeson.md": {
	id: "ibeson.md";
  slug: "ibeson";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"icogas.md": {
	id: "icogas.md";
  slug: "icogas";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"imuton.md": {
	id: "imuton.md";
  slug: "imuton";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"ipadora-sanctuary.md": {
	id: "ipadora-sanctuary.md";
  slug: "ipadora-sanctuary";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"iyhago-prime.md": {
	id: "iyhago-prime.md";
  slug: "iyhago-prime";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"klanron.md": {
	id: "klanron.md";
  slug: "klanron";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"klosdon.md": {
	id: "klosdon.md";
  slug: "klosdon";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"kusamori.md": {
	id: "kusamori.md";
  slug: "kusamori";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"mayson.md": {
	id: "mayson.md";
  slug: "mayson";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"neruvalis.md": {
	id: "neruvalis.md";
  slug: "neruvalis";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"okbridge.md": {
	id: "okbridge.md";
  slug: "okbridge";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"oniofast.md": {
	id: "oniofast.md";
  slug: "oniofast";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"oredsy.md": {
	id: "oredsy.md";
  slug: "oredsy";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"ovodon.md": {
	id: "ovodon.md";
  slug: "ovodon";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"phaaross.md": {
	id: "phaaross.md";
  slug: "phaaross";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"plodrough.md": {
	id: "plodrough.md";
  slug: "plodrough";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"skellmoor.md": {
	id: "skellmoor.md";
  slug: "skellmoor";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"sloumont.md": {
	id: "sloumont.md";
  slug: "sloumont";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"suudon.md": {
	id: "suudon.md";
  slug: "suudon";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"ubraamore.md": {
	id: "ubraamore.md";
  slug: "ubraamore";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"uyrand.md": {
	id: "uyrand.md";
  slug: "uyrand";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"vacron.md": {
	id: "vacron.md";
  slug: "vacron";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"vlurg.md": {
	id: "vlurg.md";
  slug: "vlurg";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"wrediff.md": {
	id: "wrediff.md";
  slug: "wrediff";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"wrofast.md": {
	id: "wrofast.md";
  slug: "wrofast";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
"zhuiburn.md": {
	id: "zhuiburn.md";
  slug: "zhuiburn";
  body: string;
  collection: "cities";
  data: InferEntrySchema<"cities">
} & { render(): Render[".md"] };
};
"families": {
"darkmane-family.md": {
	id: "darkmane-family.md";
  slug: "darkmane-family";
  body: string;
  collection: "families";
  data: InferEntrySchema<"families">
} & { render(): Render[".md"] };
"goldhelm-family.md": {
	id: "goldhelm-family.md";
  slug: "goldhelm-family";
  body: string;
  collection: "families";
  data: InferEntrySchema<"families">
} & { render(): Render[".md"] };
"ipadora-family.md": {
	id: "ipadora-family.md";
  slug: "ipadora-family";
  body: string;
  collection: "families";
  data: InferEntrySchema<"families">
} & { render(): Render[".md"] };
};
"history": {
"crimson-convergence.md": {
	id: "crimson-convergence.md";
  slug: "crimson-convergence";
  body: string;
  collection: "history";
  data: InferEntrySchema<"history">
} & { render(): Render[".md"] };
"dragon-era.md": {
	id: "dragon-era.md";
  slug: "dragon-era";
  body: string;
  collection: "history";
  data: InferEntrySchema<"history">
} & { render(): Render[".md"] };
"equinox-of-power.md": {
	id: "equinox-of-power.md";
  slug: "equinox-of-power";
  body: string;
  collection: "history";
  data: InferEntrySchema<"history">
} & { render(): Render[".md"] };
"first-great-war.md": {
	id: "first-great-war.md";
  slug: "first-great-war";
  body: string;
  collection: "history";
  data: InferEntrySchema<"history">
} & { render(): Render[".md"] };
"golden-war.md": {
	id: "golden-war.md";
  slug: "golden-war";
  body: string;
  collection: "history";
  data: InferEntrySchema<"history">
} & { render(): Render[".md"] };
"war-of-fodon.md": {
	id: "war-of-fodon.md";
  slug: "war-of-fodon";
  body: string;
  collection: "history";
  data: InferEntrySchema<"history">
} & { render(): Render[".md"] };
};
"kingdoms": {
"goldhelm-kingdom.md": {
	id: "goldhelm-kingdom.md";
  slug: "goldhelm-kingdom";
  body: string;
  collection: "kingdoms";
  data: InferEntrySchema<"kingdoms">
} & { render(): Render[".md"] };
"ipadora-kingdom.md": {
	id: "ipadora-kingdom.md";
  slug: "ipadora-kingdom";
  body: string;
  collection: "kingdoms";
  data: InferEntrySchema<"kingdoms">
} & { render(): Render[".md"] };
"kingdom-of-fodon.md": {
	id: "kingdom-of-fodon.md";
  slug: "kingdom-of-fodon";
  body: string;
  collection: "kingdoms";
  data: InferEntrySchema<"kingdoms">
} & { render(): Render[".md"] };
"kingdom-of-iyhago.md": {
	id: "kingdom-of-iyhago.md";
  slug: "kingdom-of-iyhago";
  body: string;
  collection: "kingdoms";
  data: InferEntrySchema<"kingdoms">
} & { render(): Render[".md"] };
"kingdom-of-vacron.md": {
	id: "kingdom-of-vacron.md";
  slug: "kingdom-of-vacron";
  body: string;
  collection: "kingdoms";
  data: InferEntrySchema<"kingdoms">
} & { render(): Render[".md"] };
"nikolem-kingdom.md": {
	id: "nikolem-kingdom.md";
  slug: "nikolem-kingdom";
  body: string;
  collection: "kingdoms";
  data: InferEntrySchema<"kingdoms">
} & { render(): Render[".md"] };
"republic-of-frada.md": {
	id: "republic-of-frada.md";
  slug: "republic-of-frada";
  body: string;
  collection: "kingdoms";
  data: InferEntrySchema<"kingdoms">
} & { render(): Render[".md"] };
"republic-of-oredsy.md": {
	id: "republic-of-oredsy.md";
  slug: "republic-of-oredsy";
  body: string;
  collection: "kingdoms";
  data: InferEntrySchema<"kingdoms">
} & { render(): Render[".md"] };
"state-of-akison.md": {
	id: "state-of-akison.md";
  slug: "state-of-akison";
  body: string;
  collection: "kingdoms";
  data: InferEntrySchema<"kingdoms">
} & { render(): Render[".md"] };
"warring-darkmane-realm.md": {
	id: "warring-darkmane-realm.md";
  slug: "warring-darkmane-realm";
  body: string;
  collection: "kingdoms";
  data: InferEntrySchema<"kingdoms">
} & { render(): Render[".md"] };
};
"languages": {
"common.md": {
	id: "common.md";
  slug: "common";
  body: string;
  collection: "languages";
  data: InferEntrySchema<"languages">
} & { render(): Render[".md"] };
"karthrun.md": {
	id: "karthrun.md";
  slug: "karthrun";
  body: string;
  collection: "languages";
  data: InferEntrySchema<"languages">
} & { render(): Render[".md"] };
"katorr.md": {
	id: "katorr.md";
  slug: "katorr";
  body: string;
  collection: "languages";
  data: InferEntrySchema<"languages">
} & { render(): Render[".md"] };
"kotoba.md": {
	id: "kotoba.md";
  slug: "kotoba";
  body: string;
  collection: "languages";
  data: InferEntrySchema<"languages">
} & { render(): Render[".md"] };
"nualthyr.md": {
	id: "nualthyr.md";
  slug: "nualthyr";
  body: string;
  collection: "languages";
  data: InferEntrySchema<"languages">
} & { render(): Render[".md"] };
"pyrrhith.md": {
	id: "pyrrhith.md";
  slug: "pyrrhith";
  body: string;
  collection: "languages";
  data: InferEntrySchema<"languages">
} & { render(): Render[".md"] };
"sailor-speak.md": {
	id: "sailor-speak.md";
  slug: "sailor-speak";
  body: string;
  collection: "languages";
  data: InferEntrySchema<"languages">
} & { render(): Render[".md"] };
"shayathi.md": {
	id: "shayathi.md";
  slug: "shayathi";
  body: string;
  collection: "languages";
  data: InferEntrySchema<"languages">
} & { render(): Render[".md"] };
"solaran.md": {
	id: "solaran.md";
  slug: "solaran";
  body: string;
  collection: "languages";
  data: InferEntrySchema<"languages">
} & { render(): Render[".md"] };
"sylvaren.md": {
	id: "sylvaren.md";
  slug: "sylvaren";
  body: string;
  collection: "languages";
  data: InferEntrySchema<"languages">
} & { render(): Render[".md"] };
"tharnexi.md": {
	id: "tharnexi.md";
  slug: "tharnexi";
  body: string;
  collection: "languages";
  data: InferEntrySchema<"languages">
} & { render(): Render[".md"] };
"tharnic.md": {
	id: "tharnic.md";
  slug: "tharnic";
  body: string;
  collection: "languages";
  data: InferEntrySchema<"languages">
} & { render(): Render[".md"] };
};
"magic": {
"corrupted-runes.md": {
	id: "corrupted-runes.md";
  slug: "corrupted-runes";
  body: string;
  collection: "magic";
  data: InferEntrySchema<"magic">
} & { render(): Render[".md"] };
"holotech.md": {
	id: "holotech.md";
  slug: "holotech";
  body: string;
  collection: "magic";
  data: InferEntrySchema<"magic">
} & { render(): Render[".md"] };
"malefici.md": {
	id: "malefici.md";
  slug: "malefici";
  body: string;
  collection: "magic";
  data: InferEntrySchema<"magic">
} & { render(): Render[".md"] };
"metas.md": {
	id: "metas.md";
  slug: "metas";
  body: string;
  collection: "magic";
  data: InferEntrySchema<"magic">
} & { render(): Render[".md"] };
"runestones.md": {
	id: "runestones.md";
  slug: "runestones";
  body: string;
  collection: "magic";
  data: InferEntrySchema<"magic">
} & { render(): Render[".md"] };
};
"organizations": {
"ace.md": {
	id: "ace.md";
  slug: "ace";
  body: string;
  collection: "organizations";
  data: InferEntrySchema<"organizations">
} & { render(): Render[".md"] };
"arashi.md": {
	id: "arashi.md";
  slug: "arashi";
  body: string;
  collection: "organizations";
  data: InferEntrySchema<"organizations">
} & { render(): Render[".md"] };
"butterfly.md": {
	id: "butterfly.md";
  slug: "butterfly";
  body: string;
  collection: "organizations";
  data: InferEntrySchema<"organizations">
} & { render(): Render[".md"] };
"crimson-rooks.md": {
	id: "crimson-rooks.md";
  slug: "crimson-rooks";
  body: string;
  collection: "organizations";
  data: InferEntrySchema<"organizations">
} & { render(): Render[".md"] };
"magic-societies.md": {
	id: "magic-societies.md";
  slug: "magic-societies";
  body: string;
  collection: "organizations";
  data: InferEntrySchema<"organizations">
} & { render(): Render[".md"] };
"pegasus.md": {
	id: "pegasus.md";
  slug: "pegasus";
  body: string;
  collection: "organizations";
  data: InferEntrySchema<"organizations">
} & { render(): Render[".md"] };
"rose.md": {
	id: "rose.md";
  slug: "rose";
  body: string;
  collection: "organizations";
  data: InferEntrySchema<"organizations">
} & { render(): Render[".md"] };
};
"races": {
"darkmane-elves.md": {
	id: "darkmane-elves.md";
  slug: "darkmane-elves";
  body: string;
  collection: "races";
  data: InferEntrySchema<"races">
} & { render(): Render[".md"] };
"folkwynd.md": {
	id: "folkwynd.md";
  slug: "folkwynd";
  body: string;
  collection: "races";
  data: InferEntrySchema<"races">
} & { render(): Render[".md"] };
"goldhelms.md": {
	id: "goldhelms.md";
  slug: "goldhelms";
  body: string;
  collection: "races";
  data: InferEntrySchema<"races">
} & { render(): Render[".md"] };
"golems.md": {
	id: "golems.md";
  slug: "golems";
  body: string;
  collection: "races";
  data: InferEntrySchema<"races">
} & { render(): Render[".md"] };
"ipadoras.md": {
	id: "ipadoras.md";
  slug: "ipadoras";
  body: string;
  collection: "races";
  data: InferEntrySchema<"races">
} & { render(): Render[".md"] };
"sharkai.md": {
	id: "sharkai.md";
  slug: "sharkai";
  body: string;
  collection: "races";
  data: InferEntrySchema<"races">
} & { render(): Render[".md"] };
"tharnex.md": {
	id: "tharnex.md";
  slug: "tharnex";
  body: string;
  collection: "races";
  data: InferEntrySchema<"races">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}
