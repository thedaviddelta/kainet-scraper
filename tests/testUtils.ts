export const expectFromQueries = async (
    queries: string[],
    callback: (text: string) => Promise<any>
): Promise<void> => {
    Promise.all(queries.map(callback))
        .then(results =>
            results.forEach(result =>
                expect(result).not.toBeNull()
            )
        )
};

export const expectFromWrong = async (
    callback: (text: string) => Promise<any>
): Promise<void> => (
    callback("ad463b3c3298f77dd6d21c95020feb45baf98d7a")
        .then(result => expect(result).toBeNull())
);
