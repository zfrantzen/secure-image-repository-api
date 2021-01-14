module.exports = {
    user1NonprivateFullData: {
        name: 'test1',
        type: 'test/jpeg',
        isPrivate: false,
        userId: 1,
        data: Buffer.from([116, 101, 115, 116]) // 'test' in ASCII
    },

    user1PrivateFullData: {
        name: 'test1',
        type: 'test/jpeg',
        isPrivate: true,
        userId: 1,
        data: Buffer.from([116, 101, 115, 116]) // 'test' in ASCII (but when decrpyted it will be wrong)
    },

    user1NonprivateMetadata: {
        name: 'test1',
        type: 'test/jpeg',
        isPrivate: false,
        userId: 1
    },

    user2NonprivateMetadata: {
        name: 'test2',
        type: 'test/jpeg',
        isPrivate: false,
        userId: 2
    },

    user1PrivateMetadata: {
        name: 'test1',
        type: 'test/jpeg',
        isPrivate: true,
        userId: 1
    },

    user2PrivateMetadata: {
        name: 'test2',
        type: 'test/jpeg',
        isPrivate: true,
        userId: 2
    },

    user1PrivateMetadata2: {
        name: 'test2',
        type: 'test/jpeg',
        isPrivate: true,
        userId: 1
    },
};
