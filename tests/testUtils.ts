export const expectFromQueries = <T>(
    queries: string[],
    runCb: (text: string) => Promise<T>,
    expectCb: (result: T) => any
): Promise<void> => (
    Promise.all(queries.map(runCb))
        .then(results =>
            results.forEach(expectCb)
        )
);

export const expectFromWrong = async (
    callback: (text: string) => Promise<any>,
    errValue: any = null
): Promise<void> => (
    callback("ad463b3c3298f77dd6d21c95020feb45baf98d7a")
        .then(result => expect(result).toStrictEqual(errValue))
);
