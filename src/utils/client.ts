import axios from "axios";
import UserAgent from "user-agents";

export default (
    endpoint: string,
    data?: {
        [key: string]: any
    }
) => (
    axios.post(
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
                Referer: "music.youtube.com"
            }
        }
    )
);
