import { useQueries } from "@tanstack/react-query";
import api from "../services/api";

const getData = (url) => async () => {
    const response = await api.get(url);
    return response.data;
};

export function useCommonData(enable = true) {
    const results = useQueries({
        queries: [
            {
                queryKey: ["profile"],
                queryFn: getData("/api/profile"),
                enabled: enable,
            },
            {
                queryKey: ["users"],
                queryFn: getData("/api/users"),
                enabled: enable,
            },
            {
                queryKey: ["surnames"],
                queryFn: getData("/api/surnames"),
                enabled: enable,
            },
            {
                queryKey: ["specialDays"],
                queryFn: getData("/api/special-days"),
                enabled: enable,
            },
        ]
    });

    return {
        profile: results[0].data,
        users: results[1]?.data ?? null,
        namedays: results[2]?.data ?? null,
        surnames: results[3]?.data ?? null,
        specialDays: results[4]?.data ?? null,
        isLoading: results.some((result) => result.isLoading),
        hasError: results.some((result) => result.isError),
    }
}