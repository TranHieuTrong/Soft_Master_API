const sortObject = (params) => {
    return Object.entries(params)
        .sort(([key1], [key2]) =>
            key1.toString().localeCompare(key2.toString())
        )
        .reduce((result, item) => {
            result = {
                ...result,
                [item[0]]: encodeURIComponent(
                    item[1].toString().replace(/ /g, "+")
                ),
            };

            return result;
        }, {});
};

module.exports = sortObject;
