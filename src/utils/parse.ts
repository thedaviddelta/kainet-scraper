import {
    Columns,
    NavigationEndpoint,
    ThumbnailCommon,
    Header
} from "./types";

export const text = {
    columns: <T extends "Flex" | "Fixed">(cols: Columns<T> | undefined, colIndex: number, runIndex: number, type: T = "Flex" as T) => {
        const currCol = cols?.[colIndex >= 0 ? colIndex : cols.length + colIndex];
        const runs = currCol?.[`musicResponsiveListItem${type}ColumnRenderer` as const]?.text?.runs;
        return runs?.[runIndex >= 0 ? runIndex : runs.length + runIndex]?.text;
    },
    header: (header: Header | undefined, runIndex: number, type: "title" | "subtitle" | "secondSubtitle" = "title") => {
        const runs = header?.musicDetailHeaderRenderer?.[type]?.runs;
        return runs?.[runIndex >= 0 ? runIndex : runs?.length + runIndex]?.text;
    }
};

export const thumbnails = (data?: ThumbnailCommon) => (
    data?.thumbnails?.map(t => t?.url)?.filter((url): url is string => !!url) ?? []
);

export const duration = {
    fromText: (text?: string) => {
        const parts = text?.split(":");
        if (!parts || parts.length < 2 || parts.length > 3)
            return undefined;
        if (parts.length === 3) {
            const [hours, mins, secs] = parts;
            return +hours * 3600 + +mins * 60 + +secs;
        }
        const [mins, secs] = parts;
        return +mins * 60 + +secs;
    },
    toText: (secs?: number) => {
        if (!secs || secs < 0)
            return undefined;
        const hours = Math.floor(secs / 3600);
        const hoursRest = secs % 3600;
        const mins = Math.floor(hoursRest / 60);
        const minsRest = hoursRest % 60;
        return [hours || -1, mins, minsRest]
            .filter(el => el >= 0)
            .map(el => el.toString().padStart(3 - el.toString().length, "0"))
            .join(":");
    }
};

export const num = {
    simple: (text?: string) => {
        const num = text?.replace(/\D+/, "");
        if (!num || Number.isNaN(+num))
            return undefined;
        return +num;
    },
    big: (text?: string) => {
        const multipliers = {
            "K": 1E3,
            "M": 1E6,
            "B": 1E9
        } as {
            [key: string]: number
        };

        const [, count, , multiplier] = text?.match(/([\d]+([.,][\d]+)?)\s?([KMBkmb])?/) ?? [];
        if (!count || Number.isNaN(+count))
            return undefined;
        return BigInt(Math.round(+count * 100)) * BigInt(multipliers[multiplier] ?? 1) / 100n;
    }
};

export const id = {
    browse: <T extends { navigationEndpoint?: NavigationEndpoint }>(data?: T) => (
        data?.navigationEndpoint?.browseEndpoint?.browseId
    )
}
