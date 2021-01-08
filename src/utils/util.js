module.exports = {

    // Returns a list of elements in the baseList but not in the
    // secondaryList
    listDifference : (baseList, secondaryList) => {
        result = [];

        if (secondaryList === undefined) {
            return baseList;
        }
        
        for (let i = 0; i < baseList.length; i++) {
            if (!secondaryList.includes(baseList[i])) {
                result.push(baseList[i]);
            }
        }

        return result;
    }
}