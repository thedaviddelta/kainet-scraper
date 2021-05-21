import axios, { AxiosResponse } from "axios";
import UserAgent from "user-agents";

const request = (
    endpoint: string,
    retry: number = 0
) => ({
    with: (
        data?: {
            [key: string]: string
        }
    ) => {
        const promise = axios.post(
            `https://music.youtube.com/youtubei/v1/${endpoint}?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
            {
                context: {
                    client: {
                        clientName: "WEB_REMIX",
                        clientVersion: "0.1"
                    }
                },
                ...data
            },
            {
                headers: {
                    "User-Agent": new UserAgent().toString(),
                    Origin: "https://music.youtube.com",
                    Referer: "music.youtube.com",
                    "Cache-Control": retry > 0 ? "no-cache" : ""
                }
            }
        );
        return {
            promise,
            doing: <T>(
                callback: (res: AxiosResponse) => T | undefined,
                fallback: T
            ): Promise<T> => (
                promise.then(callback)
                    .catch(() => undefined)
                    .then(result =>
                        isEmpty(result) && retry < 3
                            ? request(endpoint, retry + 1).with(data).doing(callback, fallback)
                            : result ?? fallback
                    )
            )
        }
    }
});

const isEmpty = (item: any) => (
    !item || (typeof item === "object" && "length" in item && item.length <= 0)
);

export default request;
